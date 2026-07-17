'use client';

/**
 * @fileoverview Rustic (Vanilla CSS) engine for the StepWizard pattern.
 * Uses framework-agnostic React structure plus a token-driven rustic skin.
 * Renders step indicators as numbered dots with a connecting
 * line, a content area, and a navigation bar -- all without Ant Design or
 * Tailwind. Hardcoded hex fallbacks ensure the component renders acceptably when
 * design-system tokens are not loaded.
 *
 * The skeleton shimmer runs on `ds-step-wizard-rustic-pulse`, defined in this
 * engine's skin. It dims to .4, where the global `pulse` and the modern engine's
 * shimmer both dim to .5 -- the name is namespaced so the three cannot shadow
 * one another when two engines mount on the same page.
 *
 * @example
 * <RusticStepWizard
 *   steps={[
 *     { key: 'payment', title: 'Payment', content: <PaymentForm /> },
 *     { key: 'ship', title: 'Shipping', content: <ShippingForm />, optional: true },
 *   ]}
 *   allowSkip
 *   onComplete={() => placeOrder()}
 * />
 */

import React, { useState } from 'react';
import { StickyWizardActions } from '../../runtime/sticky-actions';
import type { StepWizardProps } from '../../contracts';

const ROOT_CLASS_NAME = 'ds-pattern-step-wizard ds-engine-rustic';

// Centralized style objects (the `s` namespace). The remaining factories
// (`stepLabel()`, `progressFill()`, `skeleton()`) take the state or measurement
// that still has to reach the element inline; every painted channel is keyed
// from the skin instead, off `data-part` + `data-active`/`data-completed`.
const s = {
  container: {
    fontFamily: 'var(--ds-font-family-base)',
    paddingTop: '1.5rem',
    paddingRight: '1.5rem',
    paddingBottom: '1.5rem',
    paddingLeft: '1.5rem',
  } as React.CSSProperties,
  stepsHorizontal: {
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    marginBottom: '1.5rem',
  } as React.CSSProperties,
  stepIndicator: (active: boolean, completed: boolean) =>
    ({
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      flex: 1,
    } as React.CSSProperties),
  // Step dot: three visual states -- completed (filled primary), active
  // (outlined primary), and future (neutral). Completed dots show a checkmark;
  // active/future dots show the 1-based step number.
  stepDot: {
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'var(--ds-font-size-xs)',
    fontWeight: 600,
    flexShrink: 0,
  } as React.CSSProperties,
  stepLabel: (active: boolean) =>
    ({
      fontSize: 'var(--ds-font-size-xs)',
      fontWeight: active ? 600 : 400,
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    } as React.CSSProperties),
  stepLine: {
    flex: 1,
    height: 2,
    margin: '0 0.5rem',
  } as React.CSSProperties,
  progressBar: {
    width: '100%',
    height: 4,
    marginBottom: '1rem',
    overflow: 'hidden',
  } as React.CSSProperties,
  progressFill: (pct: number) =>
    ({
      width: `${pct}%`,
      height: '100%',
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
    fontSize: 'var(--ds-font-size-sm)',
  } as React.CSSProperties,
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.375rem 0.875rem',
    fontSize: 'var(--ds-font-size-sm)',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 150ms',
  } as React.CSSProperties,
  skeleton: (w: string, h: string) =>
    ({
      width: w,
      height: h,
      animation: 'ds-step-wizard-rustic-pulse 1.5s ease-in-out infinite',
    } as React.CSSProperties),
};

/**
 * Rustic (Vanilla CSS) engine for the StepWizard pattern.
 *
 * Renders numbered dot indicators, a connecting line, a progress bar, a content
 * area, and a navigation bar. Structural geometry remains inline while paint
 * and interaction states live in the unlayered rustic skin. No external CSS
 * framework is required.
 *
 * @param props - {@link StepWizardProps}
 * @returns A framework-agnostic card containing the step wizard.
 */
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
    progressPosture = 'rail',
    formatProgressLabel,
    actionPosture = 'inline',
    nextLabel = 'Next',
    prevLabel = 'Back',
    completeLabel = 'Complete',
    skipLabel = 'Skip',
    footer,
    loading,
    className,
    style,
  } = props;

  // Controlled/uncontrolled step index -- same pattern as Classic and Modern.
  const [internalStep, setInternalStep] = useState(0);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const current = controlledStep ?? internalStep;

  // Reset validation message on every navigation so errors from one step
  // do not bleed into the next step's view.
  const setCurrent = (step: number) => {
    if (controlledStep == null) setInternalStep(step);
    onStepChange?.(step);
    setValidationMessage(null);
  };

  const isLast = current === steps.length - 1;
  const currentDef = steps[current];
  const stickyActions = actionPosture === 'sticky-bottom';
  const progressLabel =
    formatProgressLabel?.({
      current: current + 1,
      total: steps.length,
      title: currentDef?.title ?? '',
    }) ?? `Step ${current + 1} of ${steps.length}: ${currentDef?.title ?? ''}`;
  // Progress percentage: 1-based (step 1 of 3 = 33%, not 0%).
  const progress = Math.round(((current + 1) / steps.length) * 100);

  /**
   * Runs the active step's async `validate` function (if defined).
   * Returns `true` when valid, `false` when validation fails.
   */
  const validateCurrentStep = async (): Promise<boolean> => {
    if (!currentDef?.validate) {
      setValidationMessage(null);
      return true;
    }

    setIsValidating(true);

    try {
      // validate() can return true/undefined (pass), false (generic fail),
      // or a string (specific error message).
      const result = await currentDef.validate();

      if (result === true || result === undefined) {
        setValidationMessage(null);
        return true;
      }

      setValidationMessage(typeof result === 'string' ? result : 'Please complete this step before continuing.');

      return false;
    } finally {
      setIsValidating(false);
    }
  };

  // Both advance and complete gate on validation before proceeding.
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

  // Skeleton loading: two shimmer blocks (progress + content) that match the
  // typical rendered height to prevent layout shift.
  if (loading) {
    return (
      <div
        data-part="root"
        data-loading="true"
        className={[ROOT_CLASS_NAME, className].filter(Boolean).join(' ')}
        style={{ ...s.container, ...style }}
      >
        <div data-part="skeleton-progress" style={s.skeleton('100%', '1.5rem')} />
        <div data-part="skeleton-content" style={{ ...s.skeleton('100%', '12rem'), marginTop: '1.5rem' }} />
      </div>
    );
  }

  const isVertical = orientation === 'vertical';

  const navigationContent = (
    <div
      data-part="nav-bar"
      style={{
        ...s.nav,
        width: '100%',
        marginTop: stickyActions ? 0 : s.nav.marginTop,
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}
    >
      <div>
        {current > 0 && (
          <button
            type="button"
            data-part="prev-button"
            disabled={isValidating || actionsDisabled}
            style={s.btn}
            onClick={() => setCurrent(current - 1)}
          >
            {prevLabel}
          </button>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          flex: '1 1 auto',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          gap: '0.5rem',
          alignItems: 'center',
          minWidth: 0,
        }}
      >
        {footer}
        {allowSkip && currentDef?.optional && !isLast && (
          <button
            type="button"
            data-part="skip-button"
            disabled={isValidating || actionsDisabled}
            style={s.btn}
            onClick={() => setCurrent(current + 1)}
          >
            {skipLabel}
          </button>
        )}
        {isLast ? (
          showCompleteAction ? (
            <button
              type="button"
              data-part="complete-button"
              disabled={isValidating || actionsDisabled || completeDisabled}
              style={s.btn}
              onClick={handleComplete}
            >
              {completeLabel}
            </button>
          ) : null
        ) : (
          <button
            type="button"
            data-part="next-button"
            disabled={isValidating || actionsDisabled}
            style={s.btn}
            onClick={handleAdvance}
          >
            {nextLabel}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div
      data-part="root"
      data-action-posture={actionPosture}
      data-progress-posture={progressPosture}
      className={[ROOT_CLASS_NAME, className].filter(Boolean).join(' ')}
      style={{
        ...s.container,
        ...(stickyActions
          ? {
              paddingBottom: 'var(--ds-step-wizard-action-dock-reserved-space, 7rem)',
            }
          : {}),
        ...style,
      }}
    >
      {showProgress && progressPosture === 'counter' && (
        <div data-part="step-counter" role="status" aria-live="polite" aria-label={progressLabel}>
          {progressLabel}
        </div>
      )}

      {/* Horizontal step indicators: dot + label pairs connected by lines.
          Completed steps show a checkmark; active/future steps show their number. */}
      {showProgress && progressPosture === 'rail' && !isVertical && (
        <>
          <div data-part="step-rail" data-orientation="horizontal" style={s.stepsHorizontal}>
            {steps.map((step, i) => (
              <React.Fragment key={step.key}>
                <div
                  data-part="step"
                  data-active={i === current}
                  data-completed={i < current}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                  }}
                >
                  <div
                    data-part="step-indicator"
                    data-active={i === current}
                    data-completed={i < current}
                    style={s.stepDot}
                  >
                    {i < current ? '\u2713' : i + 1}
                  </div>
                  <span data-part="step-title" data-active={i === current} style={s.stepLabel(i === current)}>
                    {step.title}
                  </span>
                </div>
                {/* Connecting line between dots; colored primary when completed */}
                {i < steps.length - 1 && (
                  <div data-part="step-connector" data-completed={i < current} style={s.stepLine} />
                )}
              </React.Fragment>
            ))}
          </div>
          {/* Progress bar below the step dots */}
          <div data-part="progress-track" style={s.progressBar}>
            <div data-part="progress-fill" style={s.progressFill(progress)} />
          </div>
        </>
      )}

      {/* Vertical mode: step list sidebar + content area side by side */}
      {showProgress && progressPosture === 'rail' && isVertical ? (
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div data-part="step-rail" data-orientation="vertical" style={{ width: 180, flexShrink: 0 }}>
            {steps.map((step, i) => (
              <div
                key={step.key}
                data-part="step"
                data-active={i === current}
                data-completed={i < current}
                style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}
              >
                <div
                  data-part="step-indicator"
                  data-active={i === current}
                  data-completed={i < current}
                  style={s.stepDot}
                >
                  {i < current ? '\u2713' : i + 1}
                </div>
                <div data-part="step-label-group">
                  <div data-part="step-title" data-active={i === current} style={s.stepLabel(i === current)}>
                    {step.title}
                  </div>
                  {step.description && (
                    <div
                      data-part="step-description"
                      style={{
                        fontSize: 'var(--ds-font-size-xs)',
                        marginTop: 2,
                      }}
                    >
                      {step.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div data-part="content" style={{ flex: 1, minWidth: 0, ...s.content }}>
            {currentDef?.content}
          </div>
        </div>
      ) : (
        <div data-part="content" style={s.content}>
          {currentDef?.content}
        </div>
      )}

      {/* Validation error banner */}
      {validationMessage && (
        <div data-part="error-panel" style={s.error}>
          {validationMessage}
        </div>
      )}

      {/* Navigation preserves disabled/loading/validation state in both postures. */}
      {stickyActions ? (
        <StickyWizardActions>
          {navigationContent}
        </StickyWizardActions>
      ) : (
        navigationContent
      )}
    </div>
  );
}
