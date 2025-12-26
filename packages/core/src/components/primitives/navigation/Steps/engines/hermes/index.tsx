'use client';

/**
 * Steps - Hermes Engine (DaisyUI/Tailwind)
 */
import React, { useMemo } from 'react';
import type { StepsProps, StepStatus } from '../../types';
import { STEPS_DEFAULTS } from '../../types';

const getStepClass = (status: StepStatus): string => {
  switch (status) {
    case 'finish':
    case 'process':
      return 'step-primary';
    case 'error':
      return 'step-error';
    default:
      return '';
  }
};

const getEffectiveStatus = (
  index: number,
  current: number,
  itemStatus?: StepStatus,
  overallStatus?: StepStatus
): StepStatus => {
  if (itemStatus) return itemStatus;
  if (index < current) return 'finish';
  if (index === current) return overallStatus ?? 'process';
  return 'wait';
};

export const Steps = React.forwardRef<HTMLUListElement, StepsProps>(
  (props, ref) => {
    const {
      current = STEPS_DEFAULTS.current!,
      direction = STEPS_DEFAULTS.direction,
      size = STEPS_DEFAULTS.size,
      status: overallStatus = STEPS_DEFAULTS.status,
      progressDot,
      onChange,
      items,
      className = '',
      style,
    } = props;

    const directionClass = direction === 'vertical' ? 'steps-vertical' : 'steps-horizontal';
    const sizeClass = size === 'small' ? 'text-sm' : '';

    const computedSteps = useMemo(() => {
      return items.map((item, index) => {
        const effectiveStatus = getEffectiveStatus(index, current, item.status, overallStatus);
        return { ...item, effectiveStatus, stepClass: getStepClass(effectiveStatus) };
      });
    }, [items, current, overallStatus]);

    const handleStepClick = (index: number, disabled?: boolean) => {
      if (!disabled && onChange) onChange(index);
    };

    return (
      <ul
        ref={ref}
        className={`steps ${directionClass} ${sizeClass} ${className}`.trim()}
        style={style}
      >
        {computedSteps.map((step, index) => {
          const isClickable = !step.disabled && onChange;
          return (
            <li
              key={index}
              className={`step ${step.stepClass} ${step.disabled ? 'opacity-50' : ''} ${isClickable ? 'cursor-pointer' : ''}`}
              onClick={() => handleStepClick(index, step.disabled)}
              data-content={progressDot ? '●' : undefined}
            >
              <div className="flex flex-col items-start">
                {step.icon && !progressDot && <span className="mb-1">{step.icon}</span>}
                <span className="font-medium">{step.title}</span>
                {step.subTitle && <span className="text-xs text-base-content/60">{step.subTitle}</span>}
                {step.description && <span className="text-sm text-base-content/70 mt-1">{step.description}</span>}
              </div>
            </li>
          );
        })}
      </ul>
    );
  }
);

Steps.displayName = 'Steps.Hermes';

export default Steps;
