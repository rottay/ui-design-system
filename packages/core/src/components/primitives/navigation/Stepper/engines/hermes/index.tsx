/**
 * Stepper - Hermes Engine (DaisyUI)
 */

'use client';

import React, { useState, useCallback } from 'react';
import type { CSSProperties } from 'react';
import type { StepperProps, StepItem, StepStatus } from '../../types';
import { STEPPER_DEFAULTS } from '../../types';

/**
 * Get DaisyUI step class based on status
 */
function getStepClass(status: StepStatus): string {
  switch (status) {
    case 'finish':
      return 'step-primary';
    case 'process':
      return 'step-primary';
    case 'error':
      return 'step-error';
    case 'wait':
    default:
      return '';
  }
}

/**
 * Compute status for step
 */
function computeStatus(index: number, current: number, itemStatus?: StepStatus): StepStatus {
  if (itemStatus) return itemStatus;
  if (index < current) return 'finish';
  if (index === current) return 'process';
  return 'wait';
}

/**
 * Render steps from items
 */
function renderDaisySteps(
  items: StepItem[],
  current: number,
  clickable: boolean,
  onChange?: (current: number) => void,
  globalStatus?: StepStatus
): React.ReactNode {
  return items.map((item, index) => {
    const status = item.status || (globalStatus && index === current ? globalStatus : computeStatus(index, current));
    const stepClass = getStepClass(status);

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
        }}
        data-content={item.icon ? undefined : (index + 1).toString()}
      >
        <div className="step-content">
          <span className="font-medium">{item.title}</span>
          {item.description && (
            <span className="text-sm opacity-60">{item.description}</span>
          )}
        </div>
      </li>
    );
  });
}

export default function HermesStepper(props: StepperProps): React.ReactElement {
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

  // Internal state for uncontrolled mode
  const [internalCurrent, setInternalCurrent] = useState(defaultCurrent);

  // Use controlled or uncontrolled state
  const current = controlledCurrent ?? internalCurrent;

  // Handle step change
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

  // DaisyUI steps classes
  const stepsClasses = [
    'steps',
    direction === 'vertical' ? 'steps-vertical' : 'steps-horizontal',
    className,
  ].filter(Boolean).join(' ');

  const containerStyle: CSSProperties = {
    width: '100%',
    ...style,
  };

  // Process children if no items provided
  let stepsContent: React.ReactNode = null;

  if (items) {
    stepsContent = renderDaisySteps(items, current, clickable, handleChange, status);
  } else if (children) {
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

  return (
    <ul
      className={`rottay-stepper rottay-stepper--hermes ${stepsClasses}`}
      style={containerStyle}
      role="navigation"
      aria-label="Progress steps"
    >
      {stepsContent}
    </ul>
  );
}

HermesStepper.displayName = 'HermesStepper';
