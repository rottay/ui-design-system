/**
 * @fileoverview Stepper Titan Engine - Rottay Design System
 * @description Ant Design-based implementation of the Stepper component.
 * Provides full-featured stepper with rich animations and comprehensive functionality.
 *
 * @remarks
 * The Titan engine leverages Ant Design's Steps component to provide:
 * - Smooth CSS transitions and animations
 * - Progress percentage display
 * - Progress dot customization
 * - Responsive layout switching
 * - Full Ant Design theme integration
 *
 * This engine is ideal for applications already using Ant Design or
 * requiring the most feature-rich stepper implementation.
 *
 * @example Basic Usage
 * ```tsx
 * <Stepper
 *   engine="titan"
 *   items={[
 *     { title: 'Step 1', description: 'First step' },
 *     { title: 'Step 2', description: 'Second step' },
 *   ]}
 *   current={0}
 * />
 * ```
 *
 * @example With Progress Percentage
 * ```tsx
 * <Stepper
 *   engine="titan"
 *   items={steps}
 *   current={1}
 *   percent={60}
 * />
 * ```
 *
 * @see {@link Stepper} for the main component
 * @see {@link StepperProps} for prop documentation
 * @see {@link https://ant.design/components/steps} Ant Design Steps documentation
 *
 * @module Stepper/Engines/Titan
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Steps } from 'antd';
import type { StepsProps } from 'antd';
import type { StepperProps, StepItem, StepStatus } from '../../types';
import { STEPPER_DEFAULTS } from '../../types';

// ============================================================================
// Mapping Utilities
// ============================================================================

/**
 * Maps our status type to Ant Design status type.
 * @param status - Our StepStatus type
 * @returns Ant Design compatible status
 * @internal
 */
function mapStatus(status?: StepStatus): StepsProps['status'] {
  if (!status) return undefined;
  return status as StepsProps['status'];
}

/**
 * Maps our size type to Ant Design size type.
 * @param size - Our size ('sm' | 'md' | 'lg')
 * @returns Ant Design size ('small' | 'default')
 * @internal
 */
function mapSize(size: 'sm' | 'md' | 'lg'): 'small' | 'default' {
  if (size === 'sm') return 'small';
  return 'default';
}

/**
 * Converts our StepItem array to Ant Design items format.
 * @param items - Array of StepItem
 * @returns Ant Design compatible items array
 * @internal
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

// ============================================================================
// Main Component
// ============================================================================

/**
 * Titan engine Stepper implementation using Ant Design Steps.
 *
 * @description
 * Provides a full-featured stepper leveraging Ant Design's Steps component.
 * Features include:
 * - Smooth animations and transitions
 * - Progress percentage indicator
 * - Customizable progress dots
 * - Responsive layout support
 * - Ant Design theme compatibility
 *
 * @param props - {@link StepperProps}
 * @returns Ant Design Steps component with Rottay styling
 */
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
   * Handles step change events from Ant Design Steps.
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
  // Items Conversion
  // ============================================================================

  /** Convert items if provided */
  const antItems = items ? convertItems(items) : undefined;

  // ============================================================================
  // Ant Design Props
  // ============================================================================

  /** Ant Design Steps component props */
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

  // ============================================================================
  // Children Processing
  // ============================================================================

  /**
   * If using children (compound pattern), convert them to items.
   * Ant Design v5 prefers the items prop but we support children for flexibility.
   */
  if (children && !items) {
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

  // ============================================================================
  // Render
  // ============================================================================

  return <Steps {...stepsProps} />;
}

// Set display name for debugging
TitanStepper.displayName = 'TitanStepper';
