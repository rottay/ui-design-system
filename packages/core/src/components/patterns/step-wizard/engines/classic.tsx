'use client';

/**
 * @fileoverview Classic engine for the StepWizard pattern, powered by Ant Design.
 * Renders a multi-step wizard with Ant Steps for progress indication, a content
 * area for the active step, and a navigation bar with Back / Next / Complete / Skip
 * buttons. Supports both horizontal and vertical orientations, per-step async
 * validation, and controlled or uncontrolled step state.
 *
 * @example
 * <ClassicStepWizard
 *   steps={[
 *     { key: 'info', title: 'Basic Info', content: <BasicInfoForm /> },
 *     { key: 'review', title: 'Review', content: <ReviewStep />, validate: () => formIsValid() },
 *   ]}
 *   onComplete={() => submitForm()}
 * />
 */

import React, { useState } from 'react';
import { Alert, Card, Steps, Button, Space, Skeleton, Progress } from 'antd';
import type { StepWizardProps } from '../StepWizard.types';

/**
 * Classic (Ant Design) engine for the StepWizard pattern.
 *
 * Wraps the wizard in an Ant Card. The Steps component shows progress while
 * the content area renders the active step's `content` ReactNode. Navigation
 * buttons are rendered in a footer bar with left-aligned Back and right-aligned
 * Skip / Next / Complete buttons.
 *
 * @param props - {@link StepWizardProps}
 * @returns An Ant Design Card containing the step wizard.
 */
export default function ClassicStepWizard(props: StepWizardProps) {
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

  // Controlled/uncontrolled step index pattern. When `controlledStep` is
  // provided, the parent owns the step state; otherwise internal state drives.
  const [internalStep, setInternalStep] = useState(0);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const current = controlledStep ?? internalStep;

  // Clear the validation message on every step change so stale errors from
  // a previous step do not persist when the user navigates forward or back.
  const setCurrent = (step: number) => {
    if (controlledStep == null) setInternalStep(step);
    onStepChange?.(step);
    setValidationMessage(null);
  };

  const isLast = current === steps.length - 1;
  const currentDef = steps[current];

  /**
   * Runs the active step's async `validate` function (if defined).
   *
   * `StepWizardProps` has always exposed `validate`, but the engine was not
   * actually executing it. That made the contract misleading and forced every
   * consumer to re-implement guard rails outside the pattern.
   *
   * We fix that here so all surfaces and apps get real step validation from
   * the underlying pattern instead of building on a broken abstraction.
   *
   * @returns `true` when validation passes (or no validator exists); `false`
   *          when it fails (sets `validationMessage` as a side effect).
   */
  const validateCurrentStep = async (): Promise<boolean> => {
    // No validator means the step is unconditionally valid.
    if (!currentDef?.validate) {
      setValidationMessage(null);
      return true;
    }

    setIsValidating(true);

    try {
      // validate() returns true/undefined for pass, false for a generic failure,
      // or a string for a specific error message shown below the step content.
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

  // Both advance and complete run validation first. If it fails, navigation
  // is blocked and the error message is rendered below the step content.
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
      <Card className={className} style={style}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    );
  }

  return (
    <Card className={className} style={style}>
      {/* Progress indicator: horizontal renders steps inline above content;
          vertical renders steps in a sidebar with content alongside. */}
      {showProgress && (
        <div style={{ marginBottom: 24 }}>
          {orientation === 'horizontal' ? (
            <Steps
              current={current}
              items={steps.map((s) => ({
                title: s.title,
                description: s.description,
                icon: s.icon,
              }))}
            />
          ) : (
            <div style={{ display: 'flex', gap: 24 }}>
              <Steps
                direction="vertical"
                current={current}
                style={{ width: 240 }}
                items={steps.map((s) => ({
                  title: s.title,
                  description: s.description,
                  icon: s.icon,
                }))}
              />
              <div style={{ flex: 1 }}>{currentDef?.content}</div>
            </div>
          )}
        </div>
      )}

      {/* In horizontal mode, the content renders below the progress bar.
          The Progress component provides a compact percentage-based bar on top. */}
      {(orientation === 'horizontal' || !showProgress) && (
        <>
          {showProgress && (
            <Progress percent={Math.round(((current + 1) / steps.length) * 100)} showInfo={false} style={{ marginBottom: 16 }} />
          )}
          <div style={{ minHeight: 200 }}>{currentDef?.content}</div>
        </>
      )}

      {/* Validation error banner shown when the current step's validate()
          returns false or an error string */}
      {validationMessage && (
        <Alert
          type="error"
          showIcon
          message="Step validation failed"
          description={validationMessage}
          style={{ marginTop: 16 }}
        />
      )}

      {/* Navigation bar: Back on the left, Skip/Next/Complete on the right.
          Skip only appears when `allowSkip` is true AND the step is optional.
          All buttons disable during validation to prevent double-submission. */}
      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {current > 0 && (
            <Button disabled={isValidating || actionsDisabled} onClick={() => setCurrent(current - 1)}>{prevLabel}</Button>
          )}
        </div>
        <Space>
          {footer}
          {allowSkip && currentDef?.optional && !isLast && (
            <Button disabled={isValidating || actionsDisabled} onClick={() => setCurrent(current + 1)}>{skipLabel}</Button>
          )}
          {isLast ? (
            showCompleteAction ? (
              <Button
                type="primary"
                loading={isValidating}
                disabled={actionsDisabled || completeDisabled}
                onClick={handleComplete}
              >
                {completeLabel}
              </Button>
            ) : null
          ) : (
            <Button type="primary" loading={isValidating} disabled={actionsDisabled} onClick={handleAdvance}>{nextLabel}</Button>
          )}
        </Space>
      </div>
    </Card>
  );
}
