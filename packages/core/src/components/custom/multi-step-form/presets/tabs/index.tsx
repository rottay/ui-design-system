'use client';

import { useState } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { MultiStepFormProps } from '../../core';
import {
  createCardStyle,
  createHoverStyle,
  createPanelHeaderStyle,
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

  const handleTabClick = (index: number) => {
    if (allowStepClick) {
      handleStepChange(index);
    }
  };

  const isLastStep = currentStep === steps.length - 1;
  const currentStepData = steps[currentStep];
  const canProceed = !currentStepData?.isValid && currentStepData?.isValid !== undefined ? false : true;

  return (
    <Box className={className} style={style}>
      {/* Tab Bar */}
      <Box
        style={{
          boxShadow: tokens.shadows.md,
          display: 'flex',
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          marginBottom: tokens.spacing[6],
        }}
      >
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isInvalid = step.isValid === false;

          return (
            <Box
              key={step.key}
              onClick={() => handleTabClick(index)}
              style={{
                position: 'relative',
                flex: 1,
                padding: `${tokens.spacing[4]} ${tokens.spacing[2]}`,
                cursor: allowStepClick ? 'pointer' : 'default',
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: tokens.spacing[1],
                }}
              >
                {step.icon}
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                    color: isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
                    transition: `color ${tokens.transitions?.fast || tokens.motion.hover}`,
                  }}
                >
                  {step.title}
                </Text>
                {isCompleted && (
                  <Box
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: tokens.colors.successScale[500],
                      color: tokens.colors.common.white,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: tokens.typography.fontSize.xs,
                    }}
                  >
                    ✓
                  </Box>
                )}
                {isInvalid && !isCompleted && (
                  <Box
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: tokens.colors.warningScale[500],
                    }}
                  />
                )}
              </Box>
              {/* Active Underline */}
              {isActive && (
                <Box
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    left: 0,
                    right: 0,
                    height: '2px',
                    backgroundColor: tokens.colors.primaryScale[600],
                  }}
                />
              )}
            </Box>
          );
        })}
      </Box>

      {/* Content */}
      <Box
        style={{
          padding: tokens.spacing[6],
          backgroundColor: tokens.colors.common.white,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          borderRadius: tokens.borderRadius.lg,
          marginBottom: tokens.spacing[6],
          minHeight: '400px',
        }}
      >
        {currentStepData.description && (
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              marginBottom: tokens.spacing[4],
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
  );
});
