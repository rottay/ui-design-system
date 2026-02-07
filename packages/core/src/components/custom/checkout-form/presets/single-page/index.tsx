'use client';

import React from 'react';
import { createPreset } from '../../../factory';
import type { CheckoutFormProps } from '../../core';

export default createPreset<CheckoutFormProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;
  const { steps, onSubmit, orderSummary, className, style } = props;

  return (
    <Box
      className={className}
      style={{
        boxShadow: tokens.shadows.md,
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing[8],
        ...style,
      }}
    >
      {/* All Steps */}
      {steps.map((step, idx) => (
        <Box
          key={step.key}
          style={{
            padding: tokens.spacing[8],
            backgroundColor: tokens.colors.common.white,
            borderRadius: tokens.borderRadius.lg,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4], marginBottom: tokens.spacing[6] }}>
            <Box
              style={{
                width: '32px',
                height: '32px',
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.primaryScale[100],
                color: tokens.colors.primaryScale[600],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                flexShrink: 0,
              }}
            >
              {idx + 1}
            </Box>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}
            >
              {step.title}
            </Text>
          </Box>
          {step.content}
        </Box>
      ))}

      {/* Order Summary */}
      {orderSummary && (
        <Box
          style={{
            padding: tokens.spacing[8],
            backgroundColor: tokens.colors.neutral[50],
            borderRadius: tokens.borderRadius.lg,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}
        >
          {orderSummary}
        </Box>
      )}

      {/* Submit Button */}
      <Box
        as="button"
        onClick={onSubmit}
        style={{
          width: '100%',
          padding: tokens.spacing[6],
          borderRadius: tokens.borderRadius.md,
          border: 'none',
          backgroundColor: tokens.colors.primaryScale[600],
          color: tokens.colors.common.white,
          fontSize: tokens.typography.fontSize.md,
          fontWeight: tokens.typography.fontWeight.semibold,
          cursor: 'pointer',
          transition: `all ${tokens.motion.hover}`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = tokens.colors.primaryScale[700];
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = tokens.colors.primaryScale[600];
        }}
      >
        Complete Order
      </Box>
    </Box>
  );
});
