'use client';

/**
 * StepWizard - Modern Engine (DaisyUI/Tailwind)
 */

import React, { useState } from 'react';
import type { StepWizardProps } from '../../types';

export default function ModernStepWizard(props: StepWizardProps) {
  const {
    steps,
    currentStep: controlledStep,
    onStepChange,
    onComplete,
    allowSkip = false,
    showProgress = true,
    orientation = 'horizontal',
    nextLabel = 'Next',
    prevLabel = 'Back',
    completeLabel = 'Complete',
    skipLabel = 'Skip',
    footer,
    loading,
    className,
    style,
  } = props;

  const [internalStep, setInternalStep] = useState(0);
  const current = controlledStep ?? internalStep;

  const setCurrent = (step: number) => {
    if (controlledStep == null) setInternalStep(step);
    onStepChange?.(step);
  };

  const isLast = current === steps.length - 1;
  const currentDef = steps[current];
  const progress = Math.round(((current + 1) / steps.length) * 100);

  if (loading) {
    return (
      <div className={`card bg-base-100 shadow-sm ${className ?? ''}`} style={style}>
        <div className="card-body animate-pulse">
          <div className="h-4 bg-base-300 rounded w-full mb-6" />
          <div className="h-48 bg-base-300 rounded w-full" />
        </div>
      </div>
    );
  }

  const isVertical = orientation === 'vertical';

  return (
    <div className={`card bg-base-100 shadow-sm ${className ?? ''}`} style={style}>
      <div className="card-body">
        {showProgress && (
          <div className={isVertical ? 'flex gap-6' : ''}>
            {/* Step indicators */}
            <ul className={`steps ${isVertical ? 'steps-vertical w-48 flex-shrink-0' : 'w-full mb-6'}`}>
              {steps.map((s, i) => (
                <li key={s.key} className={`step ${i <= current ? 'step-primary' : ''}`}>
                  <span className="text-xs">{s.title}</span>
                </li>
              ))}
            </ul>

            {isVertical && (
              <div className="flex-1 min-w-0">
                <div className="min-h-[12rem]">{currentDef?.content}</div>
              </div>
            )}
          </div>
        )}

        {(!isVertical || !showProgress) && (
          <>
            {showProgress && (
              <div className="w-full bg-base-300 rounded-full h-1.5 mb-4">
                <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            )}
            <div className="min-h-[12rem]">{currentDef?.content}</div>
          </>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <div>
            {current > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={() => setCurrent(current - 1)}>
                {prevLabel}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {footer}
            {allowSkip && currentDef?.optional && !isLast && (
              <button className="btn btn-ghost btn-sm" onClick={() => setCurrent(current + 1)}>
                {skipLabel}
              </button>
            )}
            {isLast ? (
              <button className="btn btn-primary btn-sm" onClick={onComplete}>{completeLabel}</button>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => setCurrent(current + 1)}>{nextLabel}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
