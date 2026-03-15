'use client';

import React, { useState } from 'react';
import { createPreset } from '../../../factory';
import type { PaymentFormProps, PaymentData } from '../../core';

export const StandardPreset = createPreset<PaymentFormProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text, Input, Button } = primitives;
  const { onSubmit, onChange, className, style } = props;

  const [formData, setFormData] = useState<PaymentData>({
    cardNumber: '',
    expiry: '',
    cvc: '',
    name: '',
  });

  const detectCardBrand = (number: string): string => {
    if (number.startsWith('4')) return '💳 Visa';
    if (number.startsWith('5')) return '💳 Mastercard';
    if (number.startsWith('3')) return '💳 Amex';
    if (number.startsWith('6')) return '💳 Discover';
    return '💳';
  };

  const handleChange = (field: keyof PaymentData, val: string) => {
    let formatted = val;

    if (field === 'cardNumber') {
      formatted = val.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
    } else if (field === 'expiry') {
      formatted = val.replace(/\D/g, '');
      if (formatted.length >= 2) {
        formatted = formatted.slice(0, 2) + '/' + formatted.slice(2, 4);
      }
      formatted = formatted.slice(0, 5);
    } else if (field === 'cvc') {
      formatted = val.replace(/\D/g, '').slice(0, 4);
    }

    const updated = { ...formData, [field]: formatted };
    setFormData(updated);
    onChange?.(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={className}
      style={style}
    >
      <Box style={{
        boxShadow: tokens.shadows.md, display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
        <Box>
          <Text
                       style={{
              marginBottom: tokens.spacing[1],
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.neutral[700],
            }}
          >
            Card Number
          </Text>
          <Box style={{ position: 'relative' }}>
            <Input
              value={formData.cardNumber}
              onChange={(value: string) => handleChange('cardNumber', value)}
              placeholder="1234 5678 9012 3456"
              required
            />
            <Box
              style={{
                position: 'absolute',
                right: tokens.spacing[4],
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: tokens.typography.fontSize.lg,
                pointerEvents: 'none',
              }}
            >
              {detectCardBrand(formData.cardNumber)}
            </Box>
          </Box>
        </Box>

        <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[4] }}>
          <Box>
            <Text
                           style={{
                marginBottom: tokens.spacing[1],
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[700],
              }}
            >
              Expiry Date
            </Text>
            <Input
              value={formData.expiry}
              onChange={(value: string) => handleChange('expiry', value)}
              placeholder="MM/YY"
              required
            />
          </Box>

          <Box>
            <Text
                           style={{
                marginBottom: tokens.spacing[1],
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[700],
              }}
            >
              CVC
            </Text>
            <Input
              value={formData.cvc}
              onChange={(value: string) => handleChange('cvc', value)}
              placeholder="123"
              type="password"
              required
            />
          </Box>
        </Box>

        <Box>
          <Text
                       style={{
              marginBottom: tokens.spacing[1],
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.neutral[700],
            }}
          >
            Cardholder Name
          </Text>
          <Input
            value={formData.name}
            onChange={(value: string) => handleChange('name', value)}
            placeholder="John Doe"
            required
          />
        </Box>

        {onSubmit && (
          <Button htmlType="submit" variant="primary" style={{ marginTop: tokens.spacing[2] }}>
            Submit Payment
          </Button>
        )}
      </Box>
    </form>
  );
});

StandardPreset.displayName = 'PaymentFormStandardPreset';
