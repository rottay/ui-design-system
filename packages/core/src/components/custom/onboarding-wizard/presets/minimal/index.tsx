'use client';

import React, { useState } from 'react';
import { createPreset } from '../../../factory';
import { createSurfaceStyle } from '../../../helpers';
import type { OnboardingWizardProps } from '../../core';

export default createPreset<OnboardingWizardProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text, Button } = primitives;
  const {
    steps,
    currentStep: controlledStep,
    onStepChange,
    onComplete,
    onSkip,
    nextLabel = 'Continue',
    backLabel = 'Back',
    skipLabel = 'Skip',
    completeLabel = 'Complete',
    className,
    style,
  } = props;

  const [internalStep, setInternalStep] = useState(0);
  const currentStepIndex = controlledStep !== undefined ? controlledStep : internalStep;
  const currentStepData = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const surfaceStyle = createSurfaceStyle(tokens);

  const handleNext = () => {
    if (isLastStep) {
      onComplete?.();
    } else {
      const nextStep = currentStepIndex + 1;
      if (onStepChange) {
        onStepChange(nextStep);
      } else {
        setInternalStep(nextStep);
      }
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      const prevStep = currentStepIndex - 1;
      if (onStepChange) {
        onStepChange(prevStep);
      } else {
        setInternalStep(prevStep);
      }
    }
  };

  const handleSkip = () => {
    if (currentStepData?.optional) {
      handleNext();
    } else {
      onSkip?.();
    }
  };

  return (
    <Box
      className={className}
      style={{
        ...surfaceStyle,
        borderRadius: tokens.borderRadius.lg,
        padding: tokens.spacing[8],
        maxWidth: '600px',
        margin: '0 auto',
        ...style,
      }}
    >
      {/* Progress Bar */}
      <Box
        style={{
          width: '100%',
          height: '6px',
          background: tokens.colors.neutral[100],
          borderRadius: tokens.borderRadius.full,
          marginBottom: tokens.spacing[4],
          overflow: 'hidden',
        }}
      >
        <Box
          style={{
            width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
            height: '100%',
            background: tokens.colors.primaryScale[600],
            transition: `all ${tokens.motion.hover}`,
            borderRadius: tokens.borderRadius.full,
          }}
        />
      </Box>

      {/* Step Counter */}
      <Text
        style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.neutral[500],
          fontWeight: tokens.typography.fontWeight.medium,
          marginBottom: tokens.spacing[8],
          textAlign: 'center',
        }}
      >
        Step {currentStepIndex + 1} of {steps.length}
      </Text>

      {/* Step Content */}
      <Box
        style={{
          minHeight: '300px',
          marginBottom: tokens.spacing[8],
        }}
      >
        <Text
          style={{
            fontSize: tokens.typography.fontSize['2xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
            marginBottom: tokens.spacing[2],
          }}
        >
          {currentStepData?.title}
        </Text>

        {currentStepData?.description && (
          <Text
            style={{
              fontSize: tokens.typography.fontSize.md,
              color: tokens.colors.neutral[600],
              marginBottom: tokens.spacing[8],
            }}
          >
            {currentStepData.description}
          </Text>
        )}

        <Box>{currentStepData?.content}</Box>
      </Box>

      {/* Footer Buttons */}
      <Box
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: tokens.spacing[6],
          borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
        }}
      >
        <Box>
          {!isFirstStep && (
            <Button
              onClick={handleBack}
              style={{
                background: 'transparent',
                color: tokens.colors.neutral[600],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                padding: `${tokens.spacing[2]} ${tokens.spacing[6]}`,
                borderRadius: tokens.borderRadius.md,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              {backLabel}
            </Button>
          )}
        </Box>

        <Box style={{ display: 'flex', gap: tokens.spacing[4] }}>
          {(currentStepData?.optional || onSkip) && !isLastStep && (
            <Button
              onClick={handleSkip}
              style={{
                background: 'transparent',
                color: tokens.colors.neutral[500],
                border: 'none',
                padding: `${tokens.spacing[2]} ${tokens.spacing[6]}`,
                borderRadius: tokens.borderRadius.md,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              {skipLabel}
            </Button>
          )}

          <Button
            onClick={handleNext}
            style={{
              background: tokens.colors.primaryScale[600],
              color: tokens.colors.common.white,
              border: 'none',
              padding: `${tokens.spacing[2]} ${tokens.spacing[8]}`,
              borderRadius: tokens.borderRadius.md,
              fontWeight: tokens.typography.fontWeight.semibold,
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
            }}
          >
            {isLastStep ? completeLabel : nextLabel}
          </Button>
        </Box>
      </Box>
    </Box>
  );
});
