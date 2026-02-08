'use client';

import React, {useState, useMemo} from 'react';
import { createPreset } from '../../../factory';
import {
  createEmptyStateStyle,
  createHoverStyle,
  createSurfaceStyle,
} from '../../../helpers';
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

  const surfaceStyle = useMemo(() => createSurfaceStyle(tokens), [tokens]);

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
        maxWidth: '800px',
        margin: '0 auto',
        ...style,
      }}
    >
      {/* Step Indicator */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: tokens.spacing[8],
          gap: tokens.spacing[4],
        }}
      >
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isFuture = index > currentStepIndex;

          return (
            <Box
              key={step.key}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                maxWidth: '120px',
              }}
            >
              {/* Circle */}
              <Box
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: tokens.borderRadius.full,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isCompleted || isCurrent ? tokens.colors.primaryScale[600] : tokens.colors.common.white,
                  border: isFuture ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}` : 'none',
                  color: isCompleted || isCurrent ? tokens.colors.common.white : tokens.colors.neutral[400],
                  fontWeight: tokens.typography.fontWeight.semibold,
                  fontSize: tokens.typography.fontSize.sm,
                  transition: `all ${tokens.motion.hover}`,
                  marginBottom: tokens.spacing[2],
                }}
              >
                {isCompleted ? '✓' : index + 1}
              </Box>

              {/* Title */}
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: isCurrent ? tokens.colors.neutral[900] : tokens.colors.neutral[500],
                  fontWeight: isCurrent ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                  textAlign: 'center',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                {step.title}
              </Text>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <Box
                  style={{
                    position: 'absolute',
                    top: '20px',
                    left: '50%',
                    width: '100%',
                    height: '2px',
                    background: isCompleted ? tokens.colors.primaryScale[600] : tokens.colors.neutral[200],
                    zIndex: -1,
                    transition: `all ${tokens.motion.hover}`,
                  }}
                />
              )}
            </Box>
          );
        })}
      </Box>

      {/* Step Content */}
      <Box
        style={{
          minHeight: '300px',
          marginBottom: tokens.spacing[8],
        }}
      >
        {currentStepData?.icon && (
          <Box
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: tokens.spacing[6],
              color: tokens.colors.primaryScale[600],
              fontSize: '48px',
            }}
          >
            {currentStepData.icon}
          </Box>
        )}

        <Text
          style={{
            fontSize: tokens.typography.fontSize['2xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
            textAlign: 'center',
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
              textAlign: 'center',
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
