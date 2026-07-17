/**
 * @fileoverview Stepper Rustic Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the Stepper component.
 * Provides maximum accessibility and zero external dependencies.
 *
 * @remarks
 * The Rustic engine provides a fully accessible stepper with:
 * - Zero external dependencies (no Ant Design, no DaisyUI)
 * - Full keyboard navigation (Arrow keys, Home, End, Enter, Space)
 * - ARIA attributes for screen readers
 * - CSS variable theming support
 * - Focus management and visual indicators
 *
 * This engine is ideal for projects requiring maximum accessibility,
 * minimal bundle size, or those avoiding framework dependencies.
 *
 * @example Basic Usage
 * ```tsx
 * <Stepper
 *   engine="rustic"
 *   items={[
 *     { title: 'Step 1', description: 'First step' },
 *     { title: 'Step 2', description: 'Second step' },
 *   ]}
 *   current={0}
 * />
 * ```
 *
 * @example With Keyboard Navigation
 * ```tsx
 * // Rustic engine automatically supports:
 * // - Arrow Left/Right: Navigate between steps
 * // - Home/End: Jump to first/last step
 * // - Enter/Space: Activate focused step
 * <Stepper
 *   engine="rustic"
 *   items={steps}
 *   current={current}
 *   clickable
 *   onChange={handleChange}
 * />
 * ```
 *
 * @see {@link Stepper} for the main component
 * @see {@link StepperProps} for prop documentation
 *
 * @module Stepper/Engines/Rustic
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useCallback, useRef, Children, isValidElement } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import type { StepperProps, StepItem, StepStatus, StepProps } from '../../contracts';
import { STEPPER_DEFAULTS, SIZE_MAP, FONT_SIZE_MAP } from '../../contracts';

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Computes the status for a step based on its position.
 * @param index - Step index
 * @param current - Current active step
 * @param itemStatus - Optional explicit status
 * @param globalStatus - Optional global status override
 * @returns Computed step status
 * @internal
 */
function computeStatus(index: number, current: number, itemStatus?: StepStatus, globalStatus?: StepStatus): StepStatus {
  if (itemStatus) return itemStatus;
  if (globalStatus && index === current) return globalStatus;
  if (index < current) return 'finish';
  if (index === current) return 'process';
  return 'wait';
}

// ============================================================================
// Icon Components
// ============================================================================

/**
 * Check icon for completed steps.
 * @internal
 */
const CheckIcon = ({ size }: { size: number }) => (
  <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 16 16" fill="none">
    <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Error icon for error state steps.
 * @internal
 */
const ErrorIcon = ({ size }: { size: number }) => (
  <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 16 16" fill="none">
    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ============================================================================
// Step Renderer
// ============================================================================

/**
 * Renders a single step element with all styling and accessibility attributes.
 * @param item - Step item data
 * @param index - Step index
 * @param totalSteps - Total number of steps
 * @param current - Current active step
 * @param size - Step size
 * @param direction - Layout direction
 * @param variant - Visual variant
 * @param labelPlacement - Label position
 * @param clickable - Whether clickable
 * @param focusedIndex - Currently focused step index
 * @param globalStatus - Global status override
 * @param onChange - Change callback
 * @returns Step React node
 * @internal
 */
function renderStep(
  item: StepItem,
  index: number,
  totalSteps: number,
  current: number,
  size: 'sm' | 'md' | 'lg',
  direction: 'horizontal' | 'vertical',
  variant: 'default' | 'simple' | 'circles',
  labelPlacement: 'horizontal' | 'vertical',
  clickable: boolean,
  focusedIndex: number | null,
  globalStatus?: StepStatus,
  onChange?: (index: number) => void
): React.ReactNode {
  const status = computeStatus(index, current, item.status, globalStatus);
  // Resolve pixel dimensions and font sizes from the shared size maps.
  // These are used for both the circular icon container and the text labels.
  const iconSize = SIZE_MAP[size];
  const fontSize = FONT_SIZE_MAP[size];
  const isLast = index === totalSteps - 1;
  const isFocused = focusedIndex === index;

  // Step container styles
  const stepStyle: CSSProperties = {
    display: 'flex',
    flexDirection: direction === 'vertical' ? 'row' : labelPlacement === 'vertical' ? 'column' : 'row',
    alignItems: direction === 'vertical' ? 'flex-start' : labelPlacement === 'vertical' ? 'center' : 'center',
    gap: '12px',
    flex: direction === 'horizontal' && !isLast ? 1 : 'none',
    opacity: item.disabled ? 0.5 : 1,
    cursor: clickable && !item.disabled ? 'pointer' : 'default',
  };

  // Icon container styles
  const iconStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: iconSize,
    height: iconSize,
    minWidth: iconSize,
    fontSize: fontSize.title,
    fontWeight: 500,
    transition: 'all 0.3s ease',
  };

  // Content container styles
  const contentStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    textAlign: labelPlacement === 'vertical' && direction === 'horizontal' ? 'center' : 'left',
  };

  // Title styles
  const titleStyle: CSSProperties = {
    fontSize: fontSize.title,
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  // Description styles
  const descStyle: CSSProperties = {
    fontSize: fontSize.description,
  };

  // Connector lines link adjacent steps visually. In horizontal mode, they
  // stretch between step icons; the fill rides `data-status` in the skin.
  const connectorStyle: CSSProperties = direction === 'horizontal' ? {
    flex: 1,
    minWidth: '32px',
    height: 'var(--ds-stepper-connector-width, 1px)',
    margin: '0 8px',
    alignSelf: 'center',
    transition: 'background-color 0.3s ease',
  } : {};

  /**
   * Renders the step icon based on status and custom icon.
   */
  const renderIcon = () => {
    if (item.icon) return item.icon;
    if (status === 'finish' && variant !== 'simple') return <CheckIcon size={iconSize} />;
    if (status === 'error') return <ErrorIcon size={iconSize} />;
    return <span>{index + 1}</span>;
  };

  return (
    <React.Fragment key={index}>
      <div
        style={stepStyle}
        onClick={() => {
          if (clickable && !item.disabled) {
            onChange?.(index);
          }
        }}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable && !item.disabled ? 0 : -1}
        aria-disabled={item.disabled}
        aria-current={status === 'process' ? 'step' : undefined}
        data-step={index}
        data-part="item"
        data-status={status}
        data-disabled={item.disabled || undefined}
        data-focused={isFocused || undefined}
      >
        <div style={iconStyle} data-part="icon">{renderIcon()}</div>
        <div style={contentStyle}>
          <div style={titleStyle} data-part="label">
            {item.title}
            {item.subTitle && (
              <span
                data-part="subtitle"
                style={{ fontSize: fontSize.description }}
              >
                {item.subTitle}
              </span>
            )}
          </div>
          {item.description && <div style={descStyle} data-part="description">{item.description}</div>}
        </div>
      </div>
      {/* Connector line (not for last step) */}
      {!isLast && direction === 'horizontal' && <div style={connectorStyle} data-part="connector" data-status={status} />}
    </React.Fragment>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Rustic engine Stepper implementation using pure HTML/CSS.
 *
 * @description
 * Provides a fully accessible stepper with no external dependencies.
 * Features include:
 * - Complete keyboard navigation
 * - ARIA attributes for screen readers
 * - CSS variable theming
 * - Focus management
 * - Zero framework dependencies
 *
 * @param props - {@link StepperProps}
 * @returns Vanilla HTML stepper with full accessibility
 */
export default function RusticStepper(props: StepperProps): React.ReactElement {
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
    children,
    className = '',
    style,
  } = props;

  // ============================================================================
  // Refs and State
  // ============================================================================

  /** Ref to the stepper container for focus management */
  const stepperRef = useRef<HTMLDivElement>(null);

  /** Internal state for uncontrolled mode */
  const [internalCurrent, setInternalCurrent] = useState(defaultCurrent);

  /** Currently focused step index for keyboard navigation */
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

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
  // Items Processing
  // ============================================================================

  /** Build items array from items prop or children */
  let stepItems: StepItem[] = [];

  if (items) {
    stepItems = items;
  } else if (children) {
    Children.forEach(children, (child) => {
      if (!isValidElement(child)) return;
      const displayName = (child.type as any)?.displayName || '';
      if (displayName === 'Stepper.Step') {
        const stepProps = child.props as StepProps;
        stepItems.push({
          title: stepProps.title,
          description: stepProps.description,
          subTitle: stepProps.subTitle,
          icon: stepProps.icon,
          status: stepProps.status,
          disabled: stepProps.disabled,
        });
      }
    });
  }

  // ============================================================================
  // Keyboard Navigation
  // ============================================================================

  /**
   * Handles keyboard navigation for accessibility.
   * Supports Arrow keys, Home, End, Enter, and Space.
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (!clickable || stepItems.length === 0) return;

      const currentFocus = focusedIndex ?? current;
      let nextFocus = currentFocus;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          nextFocus = currentFocus < stepItems.length - 1 ? currentFocus + 1 : 0;
          // Skip disabled steps -- wraps around to avoid infinite loop only
          // when we've cycled back to the starting position
          while (stepItems[nextFocus]?.disabled && nextFocus !== currentFocus) {
            nextFocus = nextFocus < stepItems.length - 1 ? nextFocus + 1 : 0;
          }
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          nextFocus = currentFocus > 0 ? currentFocus - 1 : stepItems.length - 1;
          // Same wrap-around logic in reverse direction
          while (stepItems[nextFocus]?.disabled && nextFocus !== currentFocus) {
            nextFocus = nextFocus > 0 ? nextFocus - 1 : stepItems.length - 1;
          }
          break;
        case 'Home':
          e.preventDefault();
          nextFocus = 0;
          while (stepItems[nextFocus]?.disabled && nextFocus < stepItems.length - 1) {
            nextFocus++;
          }
          break;
        case 'End':
          e.preventDefault();
          nextFocus = stepItems.length - 1;
          while (stepItems[nextFocus]?.disabled && nextFocus > 0) {
            nextFocus--;
          }
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusedIndex !== null && !stepItems[focusedIndex]?.disabled) {
            handleChange(focusedIndex);
          }
          return;
        default:
          return;
      }

      setFocusedIndex(nextFocus);
    },
    [clickable, stepItems, focusedIndex, current, handleChange]
  );

  // ============================================================================
  // Styles
  // ============================================================================

  /** Container styles */
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: direction === 'horizontal' ? 'row' : 'column',
    alignItems: direction === 'horizontal' ? 'center' : 'flex-start',
    width: '100%',
    ...style,
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div
      ref={stepperRef}
      className={`rottay-stepper rottay-stepper--rustic rottay-stepper--${direction} rottay-stepper--${size} rottay-stepper--${variant} ${className}`}
      style={containerStyle}
      role="navigation"
      aria-label="Progress steps"
      data-part="root"
      tabIndex={clickable ? 0 : -1}
      onKeyDown={handleKeyDown}
      onFocus={() => {
        if (focusedIndex === null && stepItems.length > 0) {
          setFocusedIndex(current);
        }
      }}
      onBlur={(e) => {
        if (!stepperRef.current?.contains(e.relatedTarget as Node)) {
          setFocusedIndex(null);
        }
      }}
    >
      {stepItems.map((item, index) =>
        renderStep(
          item,
          index,
          stepItems.length,
          current,
          size,
          direction,
          variant,
          labelPlacement,
          clickable,
          focusedIndex,
          status,
          handleChange
        )
      )}
    </div>
  );
}

// Set display name for debugging
RusticStepper.displayName = 'RusticStepper';
