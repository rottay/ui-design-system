'use client';

import React, { useState } from 'react';
import { createPreset } from '../../../factory';
import type { PaymentFormProps, PaymentData } from '../../core';

export const CompactPreset = createPreset<PaymentFormProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Input, Button } = primitives;
  const { onSubmit, onChange, className, style } = props;

  const [formData, setFormData] = useState<PaymentData>({
    cardNumber: '',
    expiry: '',
    cvc: '',
    name: '',
  });

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
        boxShadow: tokens.shadows.md, display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap' }}>
        <Input
          value={formData.cardNumber}
          onChange={(value: string | number) => handleChange('cardNumber', value as string)}
          placeholder="Card Number"
          required
          size="sm"
          style={{ flex: '2 1 200px' }}
        />

        <Input
          value={formData.expiry}
          onChange={(value: string | number) => handleChange('expiry', value as string)}
          placeholder="MM/YY"
          required
          size="sm"
          style={{ flex: '1 1 80px' }}
        />

        <Input
          value={formData.cvc}
          onChange={(value: string | number) => handleChange('cvc', value as string)}
          placeholder="CVC"
          type="password"
          required
          size="sm"
          style={{ flex: '1 1 80px' }}
        />

        {onSubmit && (
          <Button htmlType="submit" variant="primary" size="sm">
            Pay
          </Button>
        )}
      </Box>
    </form>
  );
});

CompactPreset.displayName = 'PaymentFormCompactPreset';
