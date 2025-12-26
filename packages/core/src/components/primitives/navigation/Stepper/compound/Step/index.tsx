/**
 * Stepper.Step - Compound Component
 * Individual step in a stepper
 */

'use client';

import React from 'react';
import type { CSSProperties } from 'react';
import type { StepProps, StepStatus } from '../../types';
import { SIZE_MAP, FONT_SIZE_MAP } from '../../types';

/**
 * Default check icon for finished steps
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
 * Default error icon
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

interface StepInternalProps extends StepProps {
  /** Size inherited from Stepper */
  size?: 'sm' | 'md' | 'lg';
  /** Step number (1-based) */
  stepNumber?: number;
  /** Direction inherited from Stepper */
  direction?: 'horizontal' | 'vertical';
  /** Variant inherited from Stepper */
  variant?: 'default' | 'simple' | 'circles';
  /** Label placement */
  labelPlacement?: 'horizontal' | 'vertical';
  /** Whether this is the last step */
  isLast?: boolean;
}

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
  const iconSize = SIZE_MAP[size];
  const fontSize = FONT_SIZE_MAP[size];

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  // Get status-based colors
  const getStatusColors = (s: StepStatus) => {
    switch (s) {
      case 'finish':
        return {
          bg: 'var(--stepper-icon-finish-bg, #1677ff)',
          color: 'var(--stepper-icon-finish-color, #fff)',
          border: 'var(--stepper-icon-finish-border, #1677ff)',
        };
      case 'process':
        return {
          bg: 'var(--stepper-icon-process-bg, #1677ff)',
          color: 'var(--stepper-icon-process-color, #fff)',
          border: 'var(--stepper-icon-process-border, #1677ff)',
        };
      case 'error':
        return {
          bg: 'var(--stepper-icon-error-bg, #fff)',
          color: 'var(--stepper-icon-error-color, #ff4d4f)',
          border: 'var(--stepper-icon-error-border, #ff4d4f)',
        };
      case 'wait':
      default:
        return {
          bg: 'var(--stepper-icon-wait-bg, #fff)',
          color: 'var(--stepper-icon-wait-color, rgba(0, 0, 0, 0.45))',
          border: 'var(--stepper-icon-wait-border, rgba(0, 0, 0, 0.25))',
        };
    }
  };

  const statusColors = getStatusColors(status);

  // Render the icon/number
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

  // Styles
  const stepStyle: CSSProperties = {
    display: 'flex',
    flexDirection: direction === 'vertical' ? 'row' : labelPlacement === 'vertical' ? 'column' : 'row',
    alignItems: direction === 'vertical' ? 'flex-start' : labelPlacement === 'vertical' ? 'center' : 'center',
    gap: 'var(--stepper-item-gap, 12px)',
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
    borderRadius: variant === 'circles' || variant === 'default' ? '50%' : 'var(--stepper-border-radius, 6px)',
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
      ? 'var(--stepper-title-error-color, #ff4d4f)'
      : status === 'process'
        ? 'var(--stepper-title-process-color, rgba(0, 0, 0, 0.88))'
        : 'var(--stepper-title-color, rgba(0, 0, 0, 0.88))',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    whiteSpace: 'nowrap',
  };

  const subTitleStyle: CSSProperties = {
    fontSize: fontSize.description,
    color: 'var(--stepper-subtitle-color, rgba(0, 0, 0, 0.45))',
    marginLeft: '8px',
  };

  const descriptionStyle: CSSProperties = {
    fontSize: fontSize.description,
    color: 'var(--stepper-description-color, rgba(0, 0, 0, 0.45))',
  };

  // Connector line style
  const connectorStyle: CSSProperties = direction === 'horizontal' ? {
    flex: 1,
    minWidth: '32px',
    height: '1px',
    backgroundColor: status === 'finish'
      ? 'var(--stepper-connector-finish-color, #1677ff)'
      : 'var(--stepper-connector-color, rgba(0, 0, 0, 0.06))',
    margin: '0 8px',
    alignSelf: 'center',
    transition: 'background-color 0.3s ease',
  } : {
    width: '1px',
    minHeight: '32px',
    backgroundColor: status === 'finish'
      ? 'var(--stepper-connector-finish-color, #1677ff)'
      : 'var(--stepper-connector-color, rgba(0, 0, 0, 0.06))',
    marginLeft: `${iconSize / 2}px`,
    marginTop: '4px',
    marginBottom: '4px',
    transition: 'background-color 0.3s ease',
  };

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
      >
        <div className="rottay-stepper-step__icon" style={iconContainerStyle}>
          {renderIcon()}
        </div>

        <div className="rottay-stepper-step__content" style={contentStyle}>
          <div className="rottay-stepper-step__title" style={titleStyle}>
            {title}
            {subTitle && (
              <span className="rottay-stepper-step__subtitle" style={subTitleStyle}>
                {subTitle}
              </span>
            )}
          </div>
          {description && (
            <div className="rottay-stepper-step__description" style={descriptionStyle}>
              {description}
            </div>
          )}
        </div>

        {children}
      </div>

      {/* Connector line (not for last step) */}
      {!isLast && direction === 'horizontal' && (
        <div className="rottay-stepper-connector" style={connectorStyle} />
      )}
    </>
  );
}

StepperStep.displayName = 'Stepper.Step';
