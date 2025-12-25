/**
 * Apollo Steps Engine
 *
 * Native HTML + Tailwind CSS steps implementation.
 * Zero external dependencies, minimal bundle size.
 */

'use client';

import { useState } from 'react';
import type { StepsProps, StepStatus } from '../../../../types/components/steps';
import { cn } from '../../../../utils/cn';

const sizeStyles = {
  small: {
    step: 'w-8 h-8 text-xs',
    title: 'text-sm',
    description: 'text-xs',
  },
  default: {
    step: 'w-10 h-10 text-sm',
    title: 'text-base',
    description: 'text-sm',
  },
};

const statusStyles: Record<StepStatus, { bg: string; text: string; border: string }> = {
  wait: {
    bg: 'bg-gray-100',
    text: 'text-gray-400',
    border: 'border-gray-300',
  },
  process: {
    bg: 'bg-blue-600',
    text: 'text-white',
    border: 'border-blue-600',
  },
  finish: {
    bg: 'bg-blue-600',
    text: 'text-white',
    border: 'border-blue-600',
  },
  error: {
    bg: 'bg-red-600',
    text: 'text-white',
    border: 'border-red-600',
  },
};

/**
 * Apollo Steps - Native HTML + Tailwind implementation
 */
function ApolloSteps({
  items = [],
  current = 0,
  onChange,
  className,
  style,
  id,
  direction = 'horizontal',
  size = 'default',
  status: currentStatus,
  'aria-label': ariaLabel,
}: StepsProps) {
  const styles = sizeStyles[size] ?? sizeStyles.default;
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

  // Render check icon for finished steps
  const CheckIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );

  // Render error icon for error steps
  const ErrorIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  );

  return (
    <div
      className={cn('w-full', className)}
      style={style}
      id={id}
      role="navigation"
      aria-label={ariaLabel ?? 'Progress steps'}
    >
      <ol
        className={cn(
          'flex',
          isVertical ? 'flex-col space-y-4' : 'flex-row items-start',
          !isVertical && 'justify-between'
        )}
      >
        {items.map((item, index) => {
          const stepStatus = getStepStatus(index, item.status);
          const statusStyle = statusStyles[stepStatus];
          const isLast = index === items.length - 1;
          const isCurrent = index === current;
          const isDisabled = item.disabled ?? false;

          return (
            <li
              key={index}
              className={cn(
                'flex',
                isVertical ? 'flex-row items-start' : 'flex-col items-center',
                !isVertical && 'flex-1',
                !isLast && !isVertical && 'relative'
              )}
              data-step-index={index}
              tabIndex={isClickable && !isDisabled ? 0 : -1}
              role="listitem"
              aria-current={isCurrent ? 'step' : undefined}
              aria-disabled={isDisabled}
              onClick={() => handleStepClick(index, isDisabled)}
              onKeyDown={(e) => handleKeyDown(index, isDisabled, e)}
              className={cn(
                isClickable && !isDisabled && 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded',
                isDisabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {/* Step number/icon */}
              <div className={cn('flex', isVertical ? 'flex-col items-center mr-4' : 'flex-row items-center mb-2')}>
                <div
                  className={cn(
                    'flex items-center justify-center rounded-full border-2 font-semibold transition-all',
                    styles.step,
                    statusStyle.bg,
                    statusStyle.text,
                    statusStyle.border,
                    isClickable && !isDisabled && 'hover:scale-110'
                  )}
                >
                  {item.icon ? (
                    <span className="flex-shrink-0">{item.icon}</span>
                  ) : stepStatus === 'finish' ? (
                    <CheckIcon />
                  ) : stepStatus === 'error' ? (
                    <ErrorIcon />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Connector line */}
                {!isLast && (
                  <div
                    className={cn(
                      'bg-gray-300',
                      isVertical ? 'w-0.5 h-full min-h-[40px] ml-0' : 'h-0.5 flex-1 mx-2',
                      stepStatus === 'finish' && 'bg-blue-600'
                    )}
                  />
                )}
              </div>

              {/* Step content */}
              <div className={cn('flex flex-col', !isVertical && 'items-center text-center', isVertical && 'flex-1')}>
                {item.title && (
                  <div
                    className={cn(
                      'font-medium',
                      styles.title,
                      stepStatus === 'wait' && 'text-gray-500',
                      stepStatus === 'process' && 'text-blue-600',
                      stepStatus === 'finish' && 'text-gray-900',
                      stepStatus === 'error' && 'text-red-600'
                    )}
                  >
                    {item.title}
                  </div>
                )}
                {item.subTitle && (
                  <div className={cn('text-gray-500 mt-0.5', styles.description)}>{item.subTitle}</div>
                )}
                {item.description && (
                  <div className={cn('text-gray-500 mt-1', styles.description)}>{item.description}</div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

ApolloSteps.displayName = 'ApolloSteps';

export default ApolloSteps;
