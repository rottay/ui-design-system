/**
 * Stepper - Base Component
 * Uses CSS variables from design tokens for consistent styling
 */

'use client';

import React, { forwardRef, useState, useCallback, Children, cloneElement, isValidElement } from 'react';
import type { CSSProperties, ReactElement } from 'react';
import type { StepperProps, StepProps, StepStatus, StepItem } from '../types';
import { STEPPER_DEFAULTS } from '../types';
import { StepperStep } from '../compound';

/**
 * Computes the status for each step based on current step
 */
function computeStepStatus(stepIndex: number, currentStep: number, stepStatus?: StepStatus): StepStatus {
  if (stepStatus) return stepStatus;
  if (stepIndex < currentStep) return 'finish';
  if (stepIndex === currentStep) return 'process';
  return 'wait';
}

/**
 * Renders steps from items prop
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

/**
 * Base Stepper component using CSS variables.
 * This is extended by engine-specific implementations.
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

    // Internal state for uncontrolled mode
    const [internalCurrent, setInternalCurrent] = useState(defaultCurrent);
    const [previousCurrent, setPreviousCurrent] = useState(defaultCurrent);

    // Use controlled or uncontrolled state
    const current = controlledCurrent ?? internalCurrent;

    // Handle step change
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

    // Process children to add props
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

    // Build CSS variables for the stepper
    const stepperVars: CSSProperties = {
      '--stepper-item-gap': '12px',
      '--stepper-connector-width': direction === 'horizontal' ? '100%' : '1px',
      '--stepper-connector-height': direction === 'horizontal' ? '1px' : '100%',
    } as CSSProperties;

    // Computed styles
    const stepperStyle: CSSProperties = {
      ...stepperVars,
      display: 'flex',
      flexDirection: direction === 'horizontal' ? 'row' : 'column',
      alignItems: direction === 'horizontal' ? 'center' : 'flex-start',
      gap: direction === 'vertical' ? '0' : undefined,
      width: '100%',
      ...style,
    };

    const stepsContainerStyle: CSSProperties = {
      display: 'flex',
      flexDirection: direction === 'horizontal' ? 'row' : 'column',
      alignItems: direction === 'horizontal' ? 'center' : 'flex-start',
      width: '100%',
    };

    const contentContainerStyle: CSSProperties = {
      marginTop: direction === 'horizontal' ? '24px' : '0',
      width: '100%',
    };

    return (
      <div
        ref={ref}
        className={`rottay-stepper rottay-stepper--${direction} rottay-stepper--${size} rottay-stepper--${variant} ${className}`}
        style={stepperStyle}
        role="navigation"
        aria-label="Progress steps"
      >
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

        {processedContents.length > 0 && (
          <div className="rottay-stepper__content" style={contentContainerStyle}>
            {processedContents}
          </div>
        )}
      </div>
    );
  }
);

BaseStepper.displayName = 'BaseStepper';
