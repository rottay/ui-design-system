'use client';

/**
 * StepWizard - Classic Engine (Ant Design)
 */

import React, { useState } from 'react';
import { Alert, Card, Steps, Button, Space, Skeleton, Progress } from 'antd';
import type { StepWizardProps } from '../../types';

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

  /**
   * `StepWizardProps` has always exposed `validate`, but the engine was not
   * actually executing it. That made the contract misleading and forced every
   * consumer to re-implement guard rails outside the pattern.
   *
   * We fix that here so all surfaces and apps get real step validation from
   * the underlying pattern instead of building on a broken abstraction.
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

      {(orientation === 'horizontal' || !showProgress) && (
        <>
          {showProgress && (
            <Progress percent={Math.round(((current + 1) / steps.length) * 100)} showInfo={false} style={{ marginBottom: 16 }} />
          )}
          <div style={{ minHeight: 200 }}>{currentDef?.content}</div>
        </>
      )}

      {validationMessage && (
        <Alert
          type="error"
          showIcon
          message="Step validation failed"
          description={validationMessage}
          style={{ marginTop: 16 }}
        />
      )}

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
