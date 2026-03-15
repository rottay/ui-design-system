'use client';

/**
 * StepWizard - Rustic Engine (Vanilla HTML/CSS with --ds-* vars)
 */

import React, { useState } from 'react';
import type { StepWizardProps } from '../../types';

const s = {
  container: {
    fontFamily: 'var(--ds-font-family-base)',
    color: 'var(--ds-color-neutral-900)',
    background: 'var(--ds-color-neutral-0, #fff)',
    border: '1px solid var(--ds-color-neutral-200)',
    borderRadius: 'var(--ds-radius-lg)',
    padding: '1.5rem',
  } as React.CSSProperties,
  stepsHorizontal: {
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    marginBottom: '1.5rem',
  } as React.CSSProperties,
  stepIndicator: (active: boolean, completed: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flex: 1,
  } as React.CSSProperties),
  stepDot: (active: boolean, completed: boolean) => ({
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'var(--ds-font-size-xs)',
    fontWeight: 600,
    flexShrink: 0,
    background: completed ? 'var(--ds-color-primary-600)' : active ? 'var(--ds-color-primary-100)' : 'var(--ds-color-neutral-100)',
    color: completed ? 'var(--ds-color-text-on-primary)' : active ? 'var(--ds-color-primary-700)' : 'var(--ds-color-neutral-500)',
    border: active ? '2px solid var(--ds-color-primary-600)' : '2px solid transparent',
  } as React.CSSProperties),
  stepLabel: (active: boolean) => ({
    fontSize: 'var(--ds-font-size-xs)',
    fontWeight: active ? 600 : 400,
    color: active ? 'var(--ds-color-neutral-900)' : 'var(--ds-color-neutral-500)',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } as React.CSSProperties),
  stepLine: (completed: boolean) => ({
    flex: 1,
    height: 2,
    background: completed ? 'var(--ds-color-primary-600)' : 'var(--ds-color-neutral-200)',
    margin: '0 0.5rem',
  } as React.CSSProperties),
  progressBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    background: 'var(--ds-color-neutral-200)',
    marginBottom: '1rem',
    overflow: 'hidden',
  } as React.CSSProperties,
  progressFill: (pct: number) => ({
    width: `${pct}%`,
    height: '100%',
    background: 'var(--ds-color-primary-600)',
    borderRadius: 2,
    transition: 'width 300ms ease',
  } as React.CSSProperties),
  content: {
    minHeight: 200,
  } as React.CSSProperties,
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1.5rem',
  } as React.CSSProperties,
  error: {
    marginTop: '1rem',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--ds-radius-md)',
    border: '1px solid var(--ds-color-error-300, #fca5a5)',
    background: 'var(--ds-color-error-50, #fef2f2)',
    color: 'var(--ds-color-error-700, #b91c1c)',
    fontSize: 'var(--ds-font-size-sm)',
  } as React.CSSProperties,
  btn: (variant: 'primary' | 'ghost') => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.375rem 0.875rem',
    borderRadius: 'var(--ds-radius-md)',
    fontSize: 'var(--ds-font-size-sm)',
    fontWeight: 500,
    cursor: 'pointer',
    border: variant === 'primary' ? '1px solid var(--ds-color-primary-600)' : '1px solid transparent',
    background: variant === 'primary' ? 'var(--ds-color-primary-600)' : 'transparent',
    color: variant === 'primary' ? 'var(--ds-color-text-on-primary)' : 'var(--ds-color-neutral-600)',
    transition: 'background 150ms',
  } as React.CSSProperties),
  skeleton: (w: string, h: string) => ({
    width: w,
    height: h,
    borderRadius: 'var(--ds-radius-md)',
    background: 'var(--ds-color-neutral-200)',
    animation: 'pulse 1.5s ease-in-out infinite',
  } as React.CSSProperties),
};

export default function RusticStepWizard(props: StepWizardProps) {
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
      <div className={className} style={{ ...s.container, ...style }}>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
        <div style={s.skeleton('100%', '1.5rem')} />
        <div style={{ ...s.skeleton('100%', '12rem'), marginTop: '1.5rem' }} />
      </div>
    );
  }

  const isVertical = orientation === 'vertical';

  return (
    <div className={className} style={{ ...s.container, ...style }}>
      {showProgress && !isVertical && (
        <>
          <div style={s.stepsHorizontal}>
            {steps.map((step, i) => (
              <React.Fragment key={step.key}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <div style={s.stepDot(i === current, i < current)}>
                    {i < current ? '\u2713' : i + 1}
                  </div>
                  <span style={s.stepLabel(i === current)}>{step.title}</span>
                </div>
                {i < steps.length - 1 && <div style={s.stepLine(i < current)} />}
              </React.Fragment>
            ))}
          </div>
          <div style={s.progressBar}>
            <div style={s.progressFill(progress)} />
          </div>
        </>
      )}

      {showProgress && isVertical ? (
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div style={{ width: 180, flexShrink: 0 }}>
            {steps.map((step, i) => (
              <div key={step.key} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={s.stepDot(i === current, i < current)}>
                  {i < current ? '\u2713' : i + 1}
                </div>
                <div>
                  <div style={s.stepLabel(i === current)}>{step.title}</div>
                  {step.description && (
                    <div style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-400)', marginTop: 2 }}>
                      {step.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: 0, ...s.content }}>{currentDef?.content}</div>
        </div>
      ) : (
        <div style={s.content}>{currentDef?.content}</div>
      )}

      {validationMessage && (
        <div style={s.error}>{validationMessage}</div>
      )}

      <div style={s.nav}>
        <div>
          {current > 0 && (
            <button disabled={isValidating || actionsDisabled} style={s.btn('ghost')} onClick={() => setCurrent(current - 1)}>{prevLabel}</button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {footer}
          {allowSkip && currentDef?.optional && !isLast && (
            <button disabled={isValidating || actionsDisabled} style={s.btn('ghost')} onClick={() => setCurrent(current + 1)}>{skipLabel}</button>
          )}
          {isLast ? (
            showCompleteAction ? (
              <button
                disabled={isValidating || actionsDisabled || completeDisabled}
                style={s.btn('primary')}
                onClick={handleComplete}
              >
                {completeLabel}
              </button>
            ) : null
          ) : (
            <button disabled={isValidating || actionsDisabled} style={s.btn('primary')} onClick={handleAdvance}>{nextLabel}</button>
          )}
        </div>
      </div>
    </div>
  );
}
