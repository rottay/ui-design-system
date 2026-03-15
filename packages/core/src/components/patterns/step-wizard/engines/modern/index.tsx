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
    actionsDisabled = false,
    completeDisabled = false,
    showCompleteAction = true,
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
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const current = controlledStep ?? internalStep;

  const setCurrent = (step: number) => {
    if (controlledStep == null) setInternalStep(step);
    onStepChange?.(step);
    setValidationMessage(null);
  };

  const isLast = current === steps.length - 1;
  const currentDef = steps[current];
  const progress = Math.round(((current + 1) / steps.length) * 100);

  const validateCurrentStep = async (): Promise<boolean> => {
    if (!currentDef?.validate) {
      setValidationMessage(null);
      return true;
    }

    setIsValidating(true);

    try {
      const result = await currentDef.validate();

      if (result === true || result === undefined) {
        setValidationMessage(null);
        return true;
      }

      setValidationMessage(
        typeof result === 'string'
          ? result
          : 'Please complete this step before continuing.'
      );

      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleAdvance = async () => {
    const isValid = await validateCurrentStep();

    if (!isValid) {
      return;
    }

    setCurrent(current + 1);
  };

  const handleComplete = async () => {
    const isValid = await validateCurrentStep();

    if (!isValid) {
      return;
    }

    await onComplete?.();
  };

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

        {validationMessage && (
          <div className="alert alert-error mt-4">
            <span>{validationMessage}</span>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <div>
            {current > 0 && (
              <button className="btn btn-ghost btn-sm" disabled={isValidating || actionsDisabled} onClick={() => setCurrent(current - 1)}>
                {prevLabel}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {footer}
            {allowSkip && currentDef?.optional && !isLast && (
              <button className="btn btn-ghost btn-sm" disabled={isValidating || actionsDisabled} onClick={() => setCurrent(current + 1)}>
                {skipLabel}
              </button>
            )}
            {isLast ? (
              showCompleteAction ? (
                <button
                  className="btn btn-primary btn-sm"
                  disabled={isValidating || actionsDisabled || completeDisabled}
                  onClick={handleComplete}
                >
                  {completeLabel}
                </button>
              ) : null
            ) : (
              <button className="btn btn-primary btn-sm" disabled={isValidating || actionsDisabled} onClick={handleAdvance}>{nextLabel}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
