/**
 * @fileoverview Stepper.Step Compound Component - Rottay Design System
 * @description Individual step component for use within a Stepper.
 * Renders the step indicator, title, description, and connector line.
 *
 * @remarks
 * This component is designed to be used as a child of the Stepper component.
 * It receives internal props from the parent Stepper for proper rendering.
 * The component supports all step statuses (wait, process, finish, error)
 * and provides visual feedback through colors and icons.
 *
 * @example Basic Usage
 * ```tsx
 * <Stepper current={1}>
 *   <Stepper.Step title="Account" description="Create your account" />
 *   <Stepper.Step title="Profile" description="Complete profile" />
 *   <Stepper.Step title="Done" description="All finished" />
 * </Stepper>
 * ```
 *
 * @example With Custom Icon
 * ```tsx
 * <Stepper.Step
 *   title="Upload"
 *   description="Upload your files"
 *   icon={<CloudUploadIcon />}
 * />
 * ```
 *
 * @example With Status Override
 * ```tsx
 * <Stepper.Step
 *   title="Validation"
 *   description="Error in form"
 *   status="error"
 * />
 * ```
 *
 * @see {@link StepProps} for complete prop documentation
 * @see {@link Stepper} for parent component
 *
 * @module Stepper/Step
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import type { CSSProperties } from 'react';
import type { StepProps, StepStatus } from '../../Stepper.types';
import { SIZE_MAP, FONT_SIZE_MAP } from '../../Stepper.types';

// ============================================================================
// Icon Components
// ============================================================================

/**
 * Default check icon for finished steps.
 * @internal
 */
const CheckIcon = ({ size }: { size: number }) => (
  <svg
    width={size * 0.5}
    height={size * 0.5}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.5 4.5L6 12L2.5 8.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Default error icon for error state steps.
 * @internal
 */
const ErrorIcon = ({ size }: { size: number }) => (
  <svg
    width={size * 0.5}
    height={size * 0.5}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 4L4 12M4 4L12 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ============================================================================
// Internal Props Interface
// ============================================================================

/**
 * Extended props including internal properties set by parent Stepper.
 * @internal
 */
interface StepInternalProps extends StepProps {
  /** Size inherited from Stepper */
  size?: 'sm' | 'md' | 'lg';
  /** Step number (1-based) for display */
  stepNumber?: number;
  /** Direction inherited from Stepper */
  direction?: 'horizontal' | 'vertical';
  /** Variant inherited from Stepper */
  variant?: 'default' | 'simple' | 'circles';
  /** Label placement relative to icon */
  labelPlacement?: 'horizontal' | 'vertical';
  /** Whether this is the last step (no connector) */
  isLast?: boolean;
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Individual step component for the Stepper.
 *
 * @description
 * Renders a single step with:
 * - Step indicator (number, icon, or status icon)
 * - Title and optional subtitle
 * - Optional description
 * - Connector line to next step
 *
 * @remarks
 * - Supports keyboard navigation (Enter/Space to activate)
 * - Includes ARIA attributes for accessibility
 * - Uses CSS variables for theming consistency
 *
 * @param props - {@link StepInternalProps}
 * @returns Individual step element with indicator and content
 */
export function StepperStep({
  title,
  description,
  subTitle,
  icon,
  status = 'wait',
  disabled = false,
  stepIndex = 0,
  active = false,
  onClick,
  size = 'md',
  stepNumber = 1,
  direction = 'horizontal',
  variant = 'default',
  labelPlacement = 'horizontal',
  isLast = false,
  className = '',
  style,
  children,
}: StepInternalProps): React.ReactElement {
  // Get size values from mappings
  const iconSize = SIZE_MAP[size];
  const fontSize = FONT_SIZE_MAP[size];

  // ============================================================================
  // Event Handlers
  // ============================================================================

  /**
   * Handles click events on the step.
   * Only triggers if step is not disabled and has an onClick handler.
   */
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  /**
   * Handles keyboard events for accessibility.
   * Supports Enter and Space key activation.
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  // ============================================================================
  // Status Color Helpers
  // ============================================================================

  /**
   * Gets the color configuration based on step status.
   * Uses CSS variables with fallback values.
   */
  const getStatusColors = (s: StepStatus) => {
    switch (s) {
      case 'finish':
        return {
          bg: 'var(--ds-stepper-icon-finish-bg, var(--ds-color-primary))',
          color: 'var(--ds-stepper-icon-finish-color, var(--ds-color-text-on-primary, var(--ds-color-text-inverse)))',
          border: 'var(--ds-stepper-icon-finish-border, var(--ds-color-primary))',
        };
      case 'process':
        return {
          bg: 'var(--ds-stepper-icon-process-bg, var(--ds-color-primary))',
          color: 'var(--ds-stepper-icon-process-color, var(--ds-color-text-on-primary, var(--ds-color-text-inverse)))',
          border: 'var(--ds-stepper-icon-process-border, var(--ds-color-primary))',
        };
      case 'error':
        return {
          bg: 'var(--ds-stepper-icon-error-bg, var(--ds-color-bg-elevated, var(--ds-color-bg-primary)))',
          color: 'var(--ds-stepper-icon-error-color, var(--ds-color-error))',
          border: 'var(--ds-stepper-icon-error-border, var(--ds-color-error))',
        };
      case 'wait':
      default:
        return {
          bg: 'var(--ds-stepper-icon-wait-bg, var(--ds-color-bg-elevated, var(--ds-color-bg-primary)))',
          color: 'var(--ds-stepper-icon-wait-color, var(--ds-color-text-tertiary, var(--ds-color-text-secondary)))',
          border: 'var(--ds-stepper-icon-wait-border, var(--ds-color-border-secondary, var(--ds-color-border-primary)))',
        };
    }
  };

  const statusColors = getStatusColors(status);

  // ============================================================================
  // Icon Renderer
  // ============================================================================

  /**
   * Renders the step icon based on status and custom icon prop.
   */
  const renderIcon = () => {
    if (icon) {
      return icon;
    }

    if (status === 'finish' && variant !== 'simple') {
      return <CheckIcon size={iconSize} />;
    }

    if (status === 'error') {
      return <ErrorIcon size={iconSize} />;
    }

    return <span>{stepNumber}</span>;
  };

  // ============================================================================
  // Styles
  // ============================================================================

  const stepStyle: CSSProperties = {
    display: 'flex',
    flexDirection: direction === 'vertical' ? 'row' : labelPlacement === 'vertical' ? 'column' : 'row',
    alignItems: direction === 'vertical' ? 'flex-start' : labelPlacement === 'vertical' ? 'center' : 'center',
    gap: 'var(--ds-stepper-item-gap, 12px)',
    flex: direction === 'horizontal' && !isLast ? 1 : 'none',
    opacity: disabled ? 0.5 : 1,
    cursor: onClick && !disabled ? 'pointer' : 'default',
    ...style,
  };

  const iconContainerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: iconSize,
    height: iconSize,
    minWidth: iconSize,
    borderRadius: variant === 'circles' || variant === 'default' ? '50%' : 'var(--ds-stepper-border-radius, 6px)',
    backgroundColor: statusColors.bg,
    color: statusColors.color,
    border: `2px solid ${statusColors.border}`,
    fontSize: fontSize.title,
    fontWeight: 500,
    transition: 'all 0.3s ease',
  };

  const contentStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    textAlign: labelPlacement === 'vertical' && direction === 'horizontal' ? 'center' : 'left',
    minWidth: 0,
  };

  const titleStyle: CSSProperties = {
    fontSize: fontSize.title,
    fontWeight: 500,
    color: status === 'error'
      ? 'var(--ds-stepper-title-error-color, var(--ds-color-error))'
      : status === 'process'
        ? 'var(--ds-stepper-title-process-color, var(--ds-color-text-primary, var(--ds-color-text)))'
        : 'var(--ds-stepper-title-color, var(--ds-color-text-primary, var(--ds-color-text)))',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    whiteSpace: 'nowrap',
  };

  const subTitleStyle: CSSProperties = {
    fontSize: fontSize.description,
    color: 'var(--ds-stepper-subtitle-color, var(--ds-color-text-tertiary, var(--ds-color-text-secondary)))',
    marginLeft: '8px',
  };

  const descriptionStyle: CSSProperties = {
    fontSize: fontSize.description,
    color: 'var(--ds-stepper-description-color, var(--ds-color-text-tertiary, var(--ds-color-text-secondary)))',
  };

  // Connector line style (horizontal or vertical)
  const connectorStyle: CSSProperties = direction === 'horizontal' ? {
    flex: 1,
    minWidth: '32px',
    height: '1px',
    backgroundColor: status === 'finish'
      ? 'var(--ds-stepper-connector-finish-color, var(--ds-color-primary))'
      : 'var(--ds-stepper-connector-color, var(--ds-color-border-secondary, var(--ds-color-border-primary)))',
    margin: '0 8px',
    alignSelf: 'center',
    transition: 'background-color 0.3s ease',
  } : {
    width: '1px',
    minHeight: '32px',
    backgroundColor: status === 'finish'
      ? 'var(--ds-stepper-connector-finish-color, var(--ds-color-primary))'
      : 'var(--ds-stepper-connector-color, var(--ds-color-border-secondary, var(--ds-color-border-primary)))',
    marginLeft: `${iconSize / 2}px`,
    marginTop: '4px',
    marginBottom: '4px',
    transition: 'background-color 0.3s ease',
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <>
      <div
        className={`rottay-stepper-step rottay-stepper-step--${status} ${active ? 'rottay-stepper-step--active' : ''} ${disabled ? 'rottay-stepper-step--disabled' : ''} ${className}`}
        style={stepStyle}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick && !disabled ? 0 : undefined}
        aria-disabled={disabled}
        aria-current={status === 'process' ? 'step' : undefined}
        data-step={stepIndex}
        data-part="item"
        data-status={status}
        data-active={active || undefined}
        data-disabled={disabled || undefined}
      >
        {/* Step Icon/Number */}
        <div className="rottay-stepper-step__icon" data-part="icon" style={iconContainerStyle}>
          {renderIcon()}
        </div>

        {/* Step Content */}
        <div className="rottay-stepper-step__content" style={contentStyle}>
          <div className="rottay-stepper-step__title" data-part="label" style={titleStyle}>
            {title}
            {subTitle && (
              <span className="rottay-stepper-step__subtitle" data-part="subtitle" style={subTitleStyle}>
                {subTitle}
              </span>
            )}
          </div>
          {description && (
            <div className="rottay-stepper-step__description" data-part="description" style={descriptionStyle}>
              {description}
            </div>
          )}
        </div>

        {/* Additional Children */}
        {children}
      </div>

      {/* Connector line (not for last step in horizontal mode) */}
      {!isLast && direction === 'horizontal' && (
        <div className="rottay-stepper-connector" data-part="connector" data-status={status} style={connectorStyle} />
      )}
    </>
  );
}

// Set display name for compound component identification
StepperStep.displayName = 'Stepper.Step';
