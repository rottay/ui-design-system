'use client';

import { useState } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { MultiStepFormProps } from '../../core';

export default createPreset<MultiStepFormProps>((context: PresetContext<MultiStepFormProps>) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;

  const {
    steps,
    currentStep: controlledStep,
    onStepChange,
    onSubmit,
    onCancel,
    nextLabel,
    backLabel,
    submitLabel,
    cancelLabel,
    loading,
    className,
    style,
  } = props;

  const [internalStep, setInternalStep] = useState(0);
  const currentStep = controlledStep !== undefined ? controlledStep : internalStep;

  const handleStepChange = (step: number) => {
    if (onStepChange) {
      onStepChange(step);
    } else {
      setInternalStep(step);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      handleStepChange(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      handleStepChange(currentStep - 1);
    }
  };

  const isLastStep = currentStep === steps.length - 1;
  const currentStepData = steps[currentStep];
  const canProceed = !currentStepData?.isValid && currentStepData?.isValid !== undefined ? false : true;

  return (
    <Box className={className} style={style}>
      {/* Step Cards */}
      <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4], marginBottom: tokens.spacing[6] }}>
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <Box
              key={step.key}
              style={{
                backgroundColor: tokens.colors.common.white,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                  isCurrent ? tokens.colors.primaryScale[400] : tokens.colors.neutral[200]
                }`,
                borderRadius: tokens.borderRadius.lg,
                overflow: 'hidden',
                transition: `all ${tokens.motion.hover}`,
                boxShadow: isCurrent ? tokens.shadows.md : 'none',
              }}
            >
              {/* Step Header */}
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: tokens.spacing[4],
                  backgroundColor: isCompleted
                    ? tokens.colors.successScale[50]
                    : isCurrent
                    ? tokens.colors.primaryScale[50]
                    : tokens.colors.neutral[50],
                  borderBottom: isCurrent ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` : 'none',
                }}
              >
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  {/* Step Number/Icon */}
                  <Box
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: isCompleted
                        ? tokens.colors.successScale[500]
                        : isCurrent
                        ? tokens.colors.primaryScale[600]
                        : tokens.colors.neutral[300],
                      color: tokens.colors.common.white,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                    }}
                  >
                    {isCompleted ? '✓' : index + 1}
                  </Box>
                  {step.icon && <Box style={{ color: tokens.colors.neutral[500] }}>{step.icon}</Box>}
                  <Box>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.md,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                      }}
                    >
                      {step.title}
                      {step.optional && (
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[500],
                            marginLeft: tokens.spacing[1],
                          }}
                        >
                          (Optional)
                        </Text>
                      )}
                    </Text>
                    {step.description && !isCurrent && (
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                        }}
                      >
                        {step.description}
                      </Text>
                    )}
                  </Box>
                </Box>
                {isCompleted && (
                  <Box
                    style={{
                      padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.successScale[100],
                      color: tokens.colors.successScale[700],
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                    }}
                  >
                    Completed
                  </Box>
                )}
                {isUpcoming && (
                  <Box
                    style={{
                      padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.neutral[100],
                      color: tokens.colors.neutral[600],
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                    }}
                  >
                    Pending
                  </Box>
                )}
              </Box>

              {/* Step Content - Only shown for current step */}
              {isCurrent && (
                <Box style={{ padding: tokens.spacing[6] }}>
                  {step.description && (
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[500],
                        marginBottom: tokens.spacing[4],
                      }}
                    >
                      {step.description}
                    </Text>
                  )}
                  <Box>{step.content}</Box>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Footer */}
      <Box
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: tokens.spacing[4],
          backgroundColor: tokens.colors.neutral[50],
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          borderRadius: tokens.borderRadius.lg,
        }}
      >
        <button
          onClick={onCancel}
          style={{
            padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
            borderRadius: tokens.borderRadius.md,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
            backgroundColor: tokens.colors.common.white,
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.medium,
            color: tokens.colors.neutral[500],
            cursor: 'pointer',
            transition: `all ${tokens.motion.hover}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = tokens.colors.neutral[100];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = tokens.colors.common.white;
          }}
        >
          {cancelLabel}
        </button>

        <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              disabled={loading}
              style={{
                padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                backgroundColor: tokens.colors.common.white,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[900],
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: `all ${tokens.motion.hover}`,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = tokens.colors.neutral[50];
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = tokens.colors.common.white;
                }
              }}
            >
              {backLabel}
            </button>
          )}
          {!isLastStep ? (
            <button
              onClick={handleNext}
              disabled={!canProceed || loading}
              style={{
                padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
                borderRadius: tokens.borderRadius.md,
                border: 'none',
                backgroundColor: canProceed && !loading ? tokens.colors.primaryScale[600] : tokens.colors.neutral[300],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.common.white,
                cursor: canProceed && !loading ? 'pointer' : 'not-allowed',
                transition: `all ${tokens.motion.hover}`,
              }}
              onMouseEnter={(e) => {
                if (canProceed && !loading) {
                  e.currentTarget.style.backgroundColor = tokens.colors.primaryScale[700];
                }
              }}
              onMouseLeave={(e) => {
                if (canProceed && !loading) {
                  e.currentTarget.style.backgroundColor = tokens.colors.primaryScale[600];
                }
              }}
            >
              {nextLabel}
            </button>
          ) : (
            <button
              onClick={onSubmit}
              disabled={!canProceed || loading}
              style={{
                padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
                borderRadius: tokens.borderRadius.md,
                border: 'none',
                backgroundColor: canProceed && !loading ? tokens.colors.primaryScale[600] : tokens.colors.neutral[300],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.common.white,
                cursor: canProceed && !loading ? 'pointer' : 'not-allowed',
                transition: `all ${tokens.motion.hover}`,
              }}
              onMouseEnter={(e) => {
                if (canProceed && !loading) {
                  e.currentTarget.style.backgroundColor = tokens.colors.primaryScale[700];
                }
              }}
              onMouseLeave={(e) => {
                if (canProceed && !loading) {
                  e.currentTarget.style.backgroundColor = tokens.colors.primaryScale[600];
                }
              }}
            >
              {loading ? 'Submitting...' : submitLabel}
            </button>
          )}
        </Box>
      </Box>
    </Box>
  );
});
