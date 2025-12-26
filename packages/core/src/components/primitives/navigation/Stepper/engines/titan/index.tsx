/**
 * Stepper - Titan Engine (Ant Design)
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Steps } from 'antd';
import type { StepsProps } from 'antd';
import type { StepperProps, StepItem, StepStatus } from '../../types';
import { STEPPER_DEFAULTS } from '../../types';

/**
 * Map our status to Ant Design status
 */
function mapStatus(status?: StepStatus): StepsProps['status'] {
  if (!status) return undefined;
  return status as StepsProps['status'];
}

/**
 * Map our size to Ant Design size
 */
function mapSize(size: 'sm' | 'md' | 'lg'): 'small' | 'default' {
  if (size === 'sm') return 'small';
  return 'default';
}

/**
 * Convert our StepItem to Ant Design format
 */
function convertItems(items: StepItem[]): StepsProps['items'] {
  return items.map((item) => ({
    title: item.title,
    description: item.description,
    subTitle: item.subTitle,
    icon: item.icon,
    status: mapStatus(item.status),
    disabled: item.disabled,
  }));
}

export default function TitanStepper(props: StepperProps): React.ReactElement {
  const {
    items,
    current: controlledCurrent,
    defaultCurrent = STEPPER_DEFAULTS.defaultCurrent,
    direction = STEPPER_DEFAULTS.direction,
    size = STEPPER_DEFAULTS.size,
    variant: _variant = STEPPER_DEFAULTS.variant,
    status,
    labelPlacement = STEPPER_DEFAULTS.labelPlacement,
    clickable = STEPPER_DEFAULTS.clickable,
    onChange,
    percent,
    progressDot = STEPPER_DEFAULTS.progressDot,
    responsive = STEPPER_DEFAULTS.responsive,
    children,
    className,
    style,
  } = props;

  // Suppress unused - Ant Design doesn't have a variant prop
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

  // Convert items if provided
  const antItems = items ? convertItems(items) : undefined;

  // Ant Design Steps props
  const stepsProps: StepsProps = {
    items: antItems,
    current,
    direction,
    size: mapSize(size),
    status: mapStatus(status),
    labelPlacement,
    onChange: clickable ? handleChange : undefined,
    percent,
    progressDot: progressDot === true ? true : undefined,
    responsive,
    className: `rottay-stepper rottay-stepper--titan ${className || ''}`,
    style,
  };

  // If using children, we need to handle them differently
  // Ant Design v5 prefers items prop, but we support children for compound pattern
  if (children && !items) {
    // For Titan, we'll still use items prop but convert children
    const childItems: StepsProps['items'] = [];

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
          status: mapStatus(stepProps.status),
          disabled: stepProps.disabled,
        });
      }
    });

    if (childItems.length > 0) {
      return <Steps {...stepsProps} items={childItems} />;
    }
  }

  return <Steps {...stepsProps} />;
}

TitanStepper.displayName = 'TitanStepper';
