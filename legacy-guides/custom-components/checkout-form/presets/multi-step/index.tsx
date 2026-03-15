'use client';

import React, { useState } from 'react';
import { createPreset } from '../../../factory';
import type { CheckoutFormProps } from '../../core';
import { CHECKOUT_FORM_DEFAULTS } from '../../core';
import {
  createCardStyle,
  createHoverStyle,
} from '../../../helpers';

export default createPreset<CheckoutFormProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;
  const {
    steps,
    onSubmit,
    onBack,
    currentStep: controlledStep,
    onStepChange,
    orderSummary,
    className,
    style,
  } = props;

  const [internalStep, setInternalStep] = useState(CHECKOUT_FORM_DEFAULTS.currentStep);
  const currentStep = controlledStep !== undefined ? controlledStep : internalStep;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const newStep = currentStep + 1;
      if (controlledStep === undefined) {
        setInternalStep(newStep);
      }
      onStepChange?.(newStep);
    } else {
      onSubmit?.();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      if (controlledStep === undefined) {
        setInternalStep(newStep);
      }
      onStepChange?.(newStep);
      onBack?.();
    }
  };

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
      {/* Main Content */}
      <Box style={{ flex: 1 }}>
        {/* Steps Progress */}
        <Box style={{ marginBottom: tokens.spacing[8] }}>
          {steps.map((step, idx) => (
            <Box key={step.key} style={{ display: 'flex', alignItems: 'center', marginBottom: tokens.spacing[4] }}>
              <Box
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor:
                    idx <= currentStep ? tokens.colors.primaryScale[600] : tokens.colors.neutral[200],
                  color: tokens.colors.common.white,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  flexShrink: 0,
                }}
              >
                {idx < currentStep ? '✓' : idx + 1}
              </Box>
              <Box style={{ marginLeft: tokens.spacing[4], flex: 1 }}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.md,
                    fontWeight:
                      idx === currentStep ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                    color:
                      idx <= currentStep ? tokens.colors.neutral[900] : tokens.colors.neutral[500],
                  }}
                >
                  {step.title}
                </Text>
              </Box>
              {idx < steps.length - 1 && (
                <Box
                  style={{
                    position: 'absolute',
                    left: '15px',
                    top: '40px',
                    width: '2px',
                    height: '24px',
                    backgroundColor:
                      idx < currentStep ? tokens.colors.primaryScale[600] : tokens.colors.neutral[200],
                  }}
                />
              )}
            </Box>
          ))}
        </Box>

        {/* Current Step Content */}
        <Box
          style={{
            padding: tokens.spacing[8],
            backgroundColor: tokens.colors.common.white,
            borderRadius: tokens.borderRadius.lg,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            marginBottom: tokens.spacing[6],
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              marginBottom: tokens.spacing[6],
            }}
          >
            {steps[currentStep]?.title}
          </Text>
          {steps[currentStep]?.content}
        </Box>

        {/* Navigation */}
        <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            style={{
              padding: `${tokens.spacing[2]} ${tokens.spacing[6]}`,
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
              backgroundColor: tokens.colors.common.white,
              color: tokens.colors.neutral[700],
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
              opacity: currentStep === 0 ? 0.5 : 1,
              transition: `all ${tokens.motion.hover}`,
            }}
            onMouseEnter={(e) => {
              if (currentStep > 0) {
                e.currentTarget.style.backgroundColor = tokens.colors.neutral[50];
                e.currentTarget.style.transform = tokens.motion.transform;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.common.white;
              e.currentTarget.style.transform = 'none';
            }}
          >
            Back
          </button>
          <button
            onClick={handleNext}
            style={{
              padding: `${tokens.spacing[2]} ${tokens.spacing[8]}`,
              borderRadius: tokens.borderRadius.md,
              border: 'none',
              backgroundColor: tokens.colors.primaryScale[600],
              color: tokens.colors.common.white,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.primaryScale[700];
              e.currentTarget.style.transform = tokens.motion.transform;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.primaryScale[600];
              e.currentTarget.style.transform = 'none';
            }}
          >
            {currentStep === steps.length - 1 ? 'Complete Order' : 'Continue'}
          </button>
        </Box>
      </Box>

      {/* Order Summary Sidebar */}
      {orderSummary && (
        <Box
          style={{
            width: '360px',
            flexShrink: 0,
          }}
        >
          {orderSummary}
        </Box>
      )}
    </Box>
  );
});
