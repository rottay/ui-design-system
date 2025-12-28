/**
 * @fileoverview Stepper Base Component - Rottay Design System
 * @description The foundational stepper component using CSS variables from design tokens.
 * This base implementation is extended by engine-specific implementations.
 *
 * @remarks
 * The BaseStepper provides the core stepper logic and styling using CSS variables
 * for consistent theming across all engines. It supports both controlled and
 * uncontrolled modes, compound components, and the items array pattern.
 *
 * This component is primarily used internally by engine implementations but
 * can also be used directly when a vanilla CSS implementation is preferred.
 *
 * @example Direct Usage
 * ```tsx
 * import { BaseStepper } from '@rottay/design-system';
 *
 * <BaseStepper
 *   items={[
 *     { title: 'Step 1', description: 'First step' },
 *     { title: 'Step 2', description: 'Second step' },
 *   ]}
 *   current={0}
 * />
 * ```
 *
 * @example With Compound Components
 * ```tsx
 * <BaseStepper current={step} clickable onChange={setStep}>
 *   <Stepper.Step title="Account" description="Create account" />
 *   <Stepper.Step title="Profile" description="Complete profile" />
 *   <Stepper.Content stepIndex={0}>
 *     <AccountForm />
 *   </Stepper.Content>
 *   <Stepper.Content stepIndex={1}>
 *     <ProfileForm />
 *   </Stepper.Content>
 * </BaseStepper>
 * ```
 *
 * @see {@link StepperProps} for complete prop documentation
 * @see {@link Stepper} for the main engine-aware component
 *
 * @module Stepper/Base
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useState, useCallback, Children, cloneElement, isValidElement } from 'react';
import type { CSSProperties, ReactElement } from 'react';
import type { StepperProps, StepProps, StepStatus, StepItem } from '../types';
import { STEPPER_DEFAULTS } from '../types';
import { StepperStep } from '../compound';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Computes the status for a step based on its position relative to current step.
 *
 * @param stepIndex - The index of the step to compute status for
 * @param currentStep - The current active step index
 * @param stepStatus - Optional explicit status override
 * @returns The computed step status
 *
 * @internal
 */
function computeStepStatus(stepIndex: number, currentStep: number, stepStatus?: StepStatus): StepStatus {
  if (stepStatus) return stepStatus;
  if (stepIndex < currentStep) return 'finish';
  if (stepIndex === currentStep) return 'process';
  return 'wait';
}

/**
 * Renders step components from the items array prop.
 *
 * @param items - Array of step items to render
 * @param current - Current active step index
 * @param props - Configuration props for rendering
 * @returns Array of StepperStep components
 *
 * @internal
 */
function renderStepsFromItems(
  items: StepItem[],
  current: number,
  props: {
    size: 'sm' | 'md' | 'lg';
    direction: 'horizontal' | 'vertical';
    variant: 'default' | 'simple' | 'circles';
    labelPlacement: 'horizontal' | 'vertical';
    clickable: boolean;
    onChange?: (current: number) => void;
    globalStatus?: StepStatus;
  }
): React.ReactNode {
  return items.map((item, index) => {
    const status = item.status || (props.globalStatus && index === current ? props.globalStatus : computeStepStatus(index, current));

    return (
      <StepperStep
        key={index}
        title={item.title}
        description={item.description}
        subTitle={item.subTitle}
        icon={item.icon}
        status={status}
        disabled={item.disabled}
        stepIndex={index}
        stepNumber={index + 1}
        active={index === current}
        size={props.size}
        direction={props.direction}
        variant={props.variant}
        labelPlacement={props.labelPlacement}
        isLast={index === items.length - 1}
        onClick={props.clickable && !item.disabled ? () => props.onChange?.(index) : undefined}
      />
    );
  });
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Base Stepper component using CSS variables.
 *
 * @description
 * This is the foundational stepper implementation that provides:
 * - Controlled and uncontrolled state management
 * - Support for both items array and compound component patterns
 * - CSS variable-based theming
 * - Full accessibility support
 *
 * @remarks
 * - Extended by engine-specific implementations (Titan, Hermes, Apollo)
 * - Uses CSS variables with `--stepper-*` prefix for theming
 * - Supports both items prop and Stepper.Step/Stepper.Content children
 *
 * @param props - {@link StepperProps}
 * @param ref - Forwarded ref to the root div element
 * @returns Stepper component with steps and optional content
 */
export const BaseStepper = forwardRef<HTMLDivElement, StepperProps>(
  (props, ref) => {
    const {
      items,
      current: controlledCurrent,
      defaultCurrent = STEPPER_DEFAULTS.defaultCurrent,
      direction = STEPPER_DEFAULTS.direction,
      size = STEPPER_DEFAULTS.size,
      variant = STEPPER_DEFAULTS.variant,
      status,
      labelPlacement = STEPPER_DEFAULTS.labelPlacement,
      clickable = STEPPER_DEFAULTS.clickable,
      onChange,
      percent: _percent,
      progressDot: _progressDot,
      responsive: _responsive,
      children,
      className = '',
      style = {},
    } = props;

    // Suppress unused warnings - these are used by engine implementations
    void _percent;
    void _progressDot;
    void _responsive;

    // ============================================================================
    // State Management
    // ============================================================================

    /** Internal state for uncontrolled mode */
    const [internalCurrent, setInternalCurrent] = useState(defaultCurrent);
    /** Previous step for animation direction tracking */
    const [previousCurrent, setPreviousCurrent] = useState(defaultCurrent);

    /** Use controlled or uncontrolled state */
    const current = controlledCurrent ?? internalCurrent;

    // ============================================================================
    // Event Handlers
    // ============================================================================

    /**
     * Handles step change events.
     * Updates internal state in uncontrolled mode and calls onChange callback.
     */
    const handleChange = useCallback(
      (stepIndex: number) => {
        setPreviousCurrent(current);

        if (controlledCurrent === undefined) {
          setInternalCurrent(stepIndex);
        }

        onChange?.(stepIndex);
      },
      [current, controlledCurrent, onChange]
    );

    // ============================================================================
    // Children Processing
    // ============================================================================

    /**
     * Processes compound component children to inject internal props.
     * Separates Step and Content children for proper rendering.
     */
    const processChildren = () => {
      const childArray = Children.toArray(children);
      const steps: ReactElement[] = [];
      const contents: ReactElement[] = [];

      childArray.forEach((child, index) => {
        if (!isValidElement(child)) return;

        const displayName = (child.type as any)?.displayName || '';

        if (displayName === 'Stepper.Step') {
          const stepProps = child.props as StepProps;
          const stepStatus = stepProps.status || (status && index === current ? status : computeStepStatus(index, current));

          steps.push(
            cloneElement(child, {
              key: index,
              stepIndex: index,
              stepNumber: index + 1,
              active: index === current,
              status: stepStatus,
              size,
              direction,
              variant,
              labelPlacement,
              isLast: index === childArray.filter((c) => isValidElement(c) && (c.type as any)?.displayName === 'Stepper.Step').length - 1,
              onClick: clickable && !stepProps.disabled ? () => handleChange(index) : undefined,
            } as any)
          );
        } else if (displayName === 'Stepper.Content') {
          contents.push(
            cloneElement(child, {
              key: index,
              currentStep: current,
              previousStep: previousCurrent,
            } as any)
          );
        }
      });

      return { steps, contents };
    };

    const { steps: processedSteps, contents: processedContents } = items
      ? { steps: null, contents: [] }
      : processChildren();

    // ============================================================================
    // Styles
    // ============================================================================

    /** CSS variables for the stepper container */
    const stepperVars: CSSProperties = {
      '--ds-stepper-item-gap': '12px',
      '--ds-stepper-connector-width': direction === 'horizontal' ? '100%' : '1px',
      '--ds-stepper-connector-height': direction === 'horizontal' ? '1px' : '100%',
    } as CSSProperties;

    /** Computed container styles */
    const stepperStyle: CSSProperties = {
      ...stepperVars,
      display: 'flex',
      flexDirection: direction === 'horizontal' ? 'row' : 'column',
      alignItems: direction === 'horizontal' ? 'center' : 'flex-start',
      gap: direction === 'vertical' ? '0' : undefined,
      width: '100%',
      ...style,
    };

    /** Steps container styles */
    const stepsContainerStyle: CSSProperties = {
      display: 'flex',
      flexDirection: direction === 'horizontal' ? 'row' : 'column',
      alignItems: direction === 'horizontal' ? 'center' : 'flex-start',
      width: '100%',
    };

    /** Content container styles */
    const contentContainerStyle: CSSProperties = {
      marginTop: direction === 'horizontal' ? '24px' : '0',
      width: '100%',
    };

    // ============================================================================
    // Render
    // ============================================================================

    return (
      <div
        ref={ref}
        className={`rottay-stepper rottay-stepper--${direction} rottay-stepper--${size} rottay-stepper--${variant} ${className}`}
        style={stepperStyle}
        role="navigation"
        aria-label="Progress steps"
      >
        {/* Steps Container */}
        <div className="rottay-stepper__steps" style={stepsContainerStyle}>
          {items
            ? renderStepsFromItems(items, current, {
                size,
                direction,
                variant,
                labelPlacement,
                clickable,
                onChange: handleChange,
                globalStatus: status,
              })
            : processedSteps}
        </div>

        {/* Content Container (for compound component pattern) */}
        {processedContents.length > 0 && (
          <div className="rottay-stepper__content" style={contentContainerStyle}>
            {processedContents}
          </div>
        )}
      </div>
    );
  }
);

// Set display name for debugging
BaseStepper.displayName = 'BaseStepper';
