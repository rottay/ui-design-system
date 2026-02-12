'use client';

/**
 * StepWizard - Classic Engine (Ant Design)
 */

import React, { useState } from 'react';
import { Card, Steps, Button, Space, Skeleton, Progress } from 'antd';
import type { StepWizardProps } from '../../types';

export default function ClassicStepWizard(props: StepWizardProps) {
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

      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {current > 0 && (
            <Button onClick={() => setCurrent(current - 1)}>{prevLabel}</Button>
          )}
        </div>
        <Space>
          {footer}
          {allowSkip && currentDef?.optional && !isLast && (
            <Button onClick={() => setCurrent(current + 1)}>{skipLabel}</Button>
          )}
          {isLast ? (
            <Button type="primary" onClick={onComplete}>{completeLabel}</Button>
          ) : (
            <Button type="primary" onClick={() => setCurrent(current + 1)}>{nextLabel}</Button>
          )}
        </Space>
      </div>
    </Card>
  );
}
