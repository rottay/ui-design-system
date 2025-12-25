/**
 * Hermes Steps Engine
 *
 * DaisyUI steps implementation with unified StepsProps.
 */

'use client';

import type { StepsProps, StepStatus } from '../../../../types/components/steps';

// Map unified size to DaisyUI size classes
const sizeClasses = {
  small: 'steps-sm',
  default: '',
};

// Map status to DaisyUI classes
const statusClasses: Record<StepStatus, string> = {
  wait: '',
  process: 'step-primary',
  finish: 'step-primary',
  error: 'step-error',
};

/**
 * Hermes Steps - DaisyUI implementation with unified StepsProps
 */
function HermesSteps({
  items = [],
  current = 0,
  onChange,
  className = '',
  style,
  id,
  direction = 'horizontal',
  size = 'default',
  status: currentStatus,
  'aria-label': ariaLabel,
}: StepsProps) {
  const isVertical = direction === 'vertical';
  const isClickable = !!onChange;

  // Determine status for each step
  const getStepStatus = (index: number, stepStatus?: StepStatus): StepStatus => {
    if (stepStatus) return stepStatus;
    if (index < current) return 'finish';
    if (index === current) return currentStatus ?? 'process';
    return 'wait';
  };

  const handleStepClick = (index: number, disabled?: boolean) => {
    if (disabled || !isClickable) return;
    onChange?.(index);
  };

  const handleKeyDown = (index: number, disabled: boolean, event: React.KeyboardEvent) => {
    if (disabled || !isClickable) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleStepClick(index, disabled);
    }

    // Arrow key navigation
    let newIndex = index;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      newIndex = index > 0 ? index - 1 : items.length - 1;
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      newIndex = index < items.length - 1 ? index + 1 : 0;
    } else if (event.key === 'Home') {
      event.preventDefault();
      newIndex = 0;
    } else if (event.key === 'End') {
      event.preventDefault();
      newIndex = items.length - 1;
    } else {
      return;
    }

    // Find next non-disabled step
    while (items[newIndex]?.disabled && newIndex !== index) {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp' || event.key === 'Home') {
        newIndex = newIndex > 0 ? newIndex - 1 : items.length - 1;
      } else {
        newIndex = newIndex < items.length - 1 ? newIndex + 1 : 0;
      }
    }

    if (!items[newIndex]?.disabled) {
      handleStepClick(newIndex, false);
      // Focus the new step
      const stepElement = document.querySelector(
        `[data-step-index="${newIndex}"]`
      ) as HTMLElement;
      stepElement?.focus();
    }
  };

  const stepsClasses = [
    'steps',
    sizeClasses[size] ?? sizeClasses.default,
    isVertical && 'steps-vertical',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="w-full" style={style} id={id}>
      <ul
        className={stepsClasses}
        role="navigation"
        aria-label={ariaLabel ?? 'Progress steps'}
      >
        {items.map((item, index) => {
          const stepStatus = getStepStatus(index, item.status);
          const statusClass = statusClasses[stepStatus];
          const isCurrent = index === current;
          const isDisabled = item.disabled ?? false;

          return (
            <li
              key={index}
              data-step-index={index}
              data-content={item.icon ? undefined : index < current ? '✓' : index + 1}
              className={`step ${statusClass} ${isDisabled ? 'step-disabled opacity-50' : ''}`}
              tabIndex={isClickable && !isDisabled ? 0 : -1}
              role="listitem"
              aria-current={isCurrent ? 'step' : undefined}
              aria-disabled={isDisabled}
              onClick={() => handleStepClick(index, isDisabled)}
              onKeyDown={(e) => handleKeyDown(index, isDisabled, e)}
              style={{
                cursor: isClickable && !isDisabled ? 'pointer' : 'default',
              }}
            >
              <div className="flex flex-col items-center">
                {item.icon && (
                  <div className="mb-1">{item.icon}</div>
                )}
                {item.title && (
                  <div className="font-medium text-sm">{item.title}</div>
                )}
                {item.subTitle && (
                  <div className="text-xs text-gray-500 mt-0.5">{item.subTitle}</div>
                )}
                {item.description && (
                  <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

HermesSteps.displayName = 'HermesSteps';

export default HermesSteps;
