'use client';

import { useState } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { MultiStepFormProps } from '../../core';
import {
  createCardStyle,
  createHoverStyle,
} from '../../../helpers';

export default createPreset<MultiStepFormProps>((context: PresetContext<MultiStepFormProps>) => {
  const { primitives, props, tokens, engine } = context;
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
    allowStepClick,
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

  const handleStepClick = (index: number) => {
    if (allowStepClick) {
      handleStepChange(index);
    }
  };

  const isLastStep = currentStep === steps.length - 1;
  const currentStepData = steps[currentStep];
  const canProceed = !currentStepData?.isValid && currentStepData?.isValid !== undefined ? false : true;

  return (
    <Box
      className={className}
      style={{
        boxShadow: tokens.shadows.md,
        display: 'flex',
        gap: tokens.spacing[8],
        ...style,
      }}
    >
      {/* Stepper Sidebar */}
      <Box
        style={{
          width: '280px',
          flexShrink: 0,
        }}
      >
        <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isUpcoming = index > currentStep;

            return (
              <Box key={step.key} style={{ display: 'flex', gap: tokens.spacing[2] }}>
                {/* Vertical Line */}
                <Box
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  {/* Circle */}
                  <Box
                    onClick={() => handleStepClick(index)}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: isCompleted
                        ? tokens.colors.primaryScale[600]
                        : isCurrent
                        ? tokens.colors.primaryScale[600]
                        : tokens.colors.neutral[200],
                      color: isCompleted || isCurrent ? tokens.colors.common.white : tokens.colors.neutral[500],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      cursor: allowStepClick ? 'pointer' : 'default',
                      transition: `all ${tokens.motion.hover}`,
                      flexShrink: 0,
                    }}
                  >
                    {isCompleted ? '✓' : index + 1}
                  </Box>
                  {/* Line */}
                  {index < steps.length - 1 && (
                    <Box
                      style={{
                        width: '2px',
                        flex: 1,
                        minHeight: '40px',
                        backgroundColor: index < currentStep ? tokens.colors.primaryScale[600] : tokens.colors.neutral[200],
                        transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
                      }}
                    />
                  )}
                </Box>
                {/* Step Info */}
                <Box style={{ flex: 1, paddingTop: tokens.spacing[1] }}>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: isCurrent ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                      color: isCurrent ? tokens.colors.neutral[900] : tokens.colors.neutral[500],
                      marginBottom: tokens.spacing[1],
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
                  {step.description && (
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
            );
          })}
        </Box>
      </Box>

      {/* Main Content */}
      <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Step Content */}
        <Box
          style={{
            flex: 1,
            padding: tokens.spacing[6],
            backgroundColor: tokens.colors.common.white,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            borderRadius: tokens.borderRadius.lg,
            marginBottom: tokens.spacing[6],
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
            {currentStepData.icon}
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
              }}
            >
              {currentStepData.title}
            </Text>
          </Box>
          {currentStepData.description && (
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[6],
              }}
            >
              {currentStepData.description}
            </Text>
          )}
          <Box>{currentStepData.content}</Box>
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
              e.currentTarget.style.transform = tokens.motion.transform;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.common.white;
              e.currentTarget.style.transform = 'none';
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
                    e.currentTarget.style.transform = tokens.motion.transform;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = tokens.colors.common.white;
                    e.currentTarget.style.transform = 'none';
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
                    e.currentTarget.style.transform = tokens.motion.transform;
                    e.currentTarget.style.transform = tokens.motion.transform;
                  }
                }}
                onMouseLeave={(e) => {
                  if (canProceed && !loading) {
                    e.currentTarget.style.backgroundColor = tokens.colors.primaryScale[600];
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.transform = 'none';
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
    </Box>
  );
});
