'use client';

import React, {useState, useMemo} from 'react';
import { createPreset } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createSurfaceStyle,
} from '../../../helpers';
import type { OnboardingWizardProps } from '../../core';

export default createPreset<OnboardingWizardProps>((context) => {
  const { primitives, props, tokens, engine } = context;
  const isGlass = engine === 'modern' && !!tokens.glass;
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
        maxWidth: '1000px',
        margin: '0 auto',
        ...style,
      }}
    >
      {/* Progress Bar */}
      <Box
        style={{
          width: '100%',
          height: '4px',
          background: tokens.colors.neutral[100],
          borderRadius: tokens.borderRadius.full,
          marginBottom: tokens.spacing[8],
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

      {/* Step Cards */}
      <Box
        style={{
          display: 'flex',
          gap: tokens.spacing[6],
          marginBottom: tokens.spacing[8],
          overflowX: 'auto',
        }}
      >
        {steps.map((step, index) => {
          const isCurrent = index === currentStepIndex;
          const cardStyle = useMemo(() => createCardStyle(tokens, { glass: isGlass, elevation: isCurrent ? 'md' : 'sm' }), [tokens]);

          return (
            <Box
              key={step.key}
              style={{
                ...cardStyle,
                minWidth: isCurrent ? '500px' : '120px',
                maxWidth: isCurrent ? '500px' : '120px',
                transition: `all ${tokens.motion.hover}`,
                cursor: 'pointer',
                opacity: isCurrent ? 1 : 0.5,
              }}
              onClick={() => {
                if (onStepChange) {
                  onStepChange(index);
                } else {
                  setInternalStep(index);
                }
              }}
            >
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[4],
                }}
              >
                {/* Step Number */}
                <Box
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: tokens.borderRadius.full,
                    background: isCurrent ? tokens.colors.primaryScale[600] : tokens.colors.neutral[200],
                    color: isCurrent ? tokens.colors.common.white : tokens.colors.neutral[600],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: tokens.typography.fontWeight.semibold,
                    fontSize: tokens.typography.fontSize.sm,
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </Box>

                {/* Title (only for current) */}
                {isCurrent && (
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.lg,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                    }}
                  >
                    {step.title}
                  </Text>
                )}

                {/* Collapsed Title */}
                {!isCurrent && (
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[600],
                      fontWeight: tokens.typography.fontWeight.medium,
                    }}
                  >
                    {step.title}
                  </Text>
                )}
              </Box>

              {/* Content (only for current) */}
              {isCurrent && (
                <Box style={{ marginTop: tokens.spacing[6] }}>
                  {step.description && (
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[600],
                        marginBottom: tokens.spacing[6],
                      }}
                    >
                      {step.description}
                    </Text>
                  )}
                  {step.content}
                </Box>
              )}
            </Box>
          );
        })}
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
