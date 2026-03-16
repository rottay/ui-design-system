'use client';

/**
 * @fileoverview Modern engine for the StepWizard pattern, powered by DaisyUI / Tailwind.
 * Renders step indicators using the DaisyUI `steps` component, a content area
 * for the active step, and a navigation bar with ghost/primary buttons. Supports
 * horizontal and vertical orientations, per-step async validation, and
 * controlled or uncontrolled step state.
 *
 * Uses a custom progress bar (div with `bg-primary` fill) instead of a dedicated
 * progress component to stay within the DaisyUI utility class system.
 *
 * @example
 * <ModernStepWizard
 *   steps={[
 *     { key: 'details', title: 'Details', content: <DetailsForm /> },
 *     { key: 'confirm', title: 'Confirm', content: <ConfirmStep /> },
 *   ]}
 *   onComplete={() => submit()}
 *   orientation="vertical"
 * />
 */

import React, { useState } from 'react';
import type { StepWizardProps } from '../StepWizard.types';

/**
 * Modern (DaisyUI / Tailwind) engine for the StepWizard pattern.
 *
 * Renders a DaisyUI card with step indicators (using the native `steps`
 * component), a content area, and navigation buttons. The progress bar is a
 * hand-rolled div with a `bg-primary` fill that transitions smoothly via CSS.
 *
 * @param props - {@link StepWizardProps}
 * @returns A DaisyUI card containing the step wizard.
 */
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

  // Controlled/uncontrolled step index -- mirrors the Classic engine pattern.
  const [internalStep, setInternalStep] = useState(0);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const current = controlledStep ?? internalStep;

  // Clear stale validation messages whenever the step changes, regardless
  // of whether the change was forward, back, or a direct jump.
  const setCurrent = (step: number) => {
    if (controlledStep == null) setInternalStep(step);
    onStepChange?.(step);
    setValidationMessage(null);
  };

  const isLast = current === steps.length - 1;
  const currentDef = steps[current];
  // Progress percentage: 1-based so step 1 of 3 shows 33%, not 0%.
  const progress = Math.round(((current + 1) / steps.length) * 100);

  /**
   * Runs the active step's async `validate` function (if defined).
   * Returns `true` when valid, `false` when validation fails (and sets the
   * error message as a side effect to be rendered in the alert).
   */
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

  // Both advance and complete gate on validation. If validation fails,
  // navigation is blocked and an error alert is shown.
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

  // Skeleton loading state: simple shimmer placeholders for the progress bar
  // and content area to prevent layout shift while data loads.
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
            {/* DaisyUI step indicators: `step-primary` is applied to all steps
                up to and including the current one so completed + active steps
                share the primary accent color. */}
            <ul className={`steps ${isVertical ? 'steps-vertical w-48 flex-shrink-0' : 'w-full mb-6'}`}>
              {steps.map((s, i) => (
                <li key={s.key} className={`step ${i <= current ? 'step-primary' : ''}`}>
                  <span className="text-xs">{s.title}</span>
                </li>
              ))}
            </ul>

            {/* In vertical mode, the content renders alongside the step list */}
            {isVertical && (
              <div className="flex-1 min-w-0">
                <div className="min-h-[12rem]">{currentDef?.content}</div>
              </div>
            )}
          </div>
        )}

        {/* Horizontal mode: content below the progress bar.
            The custom progress bar uses a transition on width for smooth fills. */}
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

        {/* Validation error alert: renders below content when validate() fails */}
        {validationMessage && (
          <div className="alert alert-error mt-4">
            <span>{validationMessage}</span>
          </div>
        )}

        {/* Navigation bar: Back (ghost) on the left, Skip/Next/Complete on the
            right. All buttons disable during async validation to prevent
            double-navigation or double-submission. */}
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
            {/* Skip only shown for optional steps that are not the final step */}
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
