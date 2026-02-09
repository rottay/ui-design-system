'use client';

import React, { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { PaymentFormProps, PaymentData } from '../../core';
import {
  createCardStyle, createAccentBarStyle, createBadgeStyle,
  createSurfaceStyle, createFocusRingStyle, createPanelHeaderStyle,
} from '../../../helpers';

export const CompactPreset = createPreset<PaymentFormProps>((context: PresetContext<PaymentFormProps>) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Text, Input, Flex, Spinner } = primitives;
  const { onSubmit, onChange, brands = ['visa', 'mastercard', 'amex'], className, style } = props;
  const isGlass = engine === 'modern' && !!tokens.glass;

  const [formData, setFormData] = useState<PaymentData>({ cardNumber: '', expiry: '', cvc: '', name: '' });
  const [processing, setProcessing] = useState(false);
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [submitHover, setSubmitHover] = useState(false);

  const focusRing = useMemo(() => createFocusRingStyle(tokens), [tokens]);
  const containerStyle = useMemo(() => ({
    ...createCardStyle(tokens, { glass: isGlass, padding: 0, elevation: 'md' }),
    overflow: 'hidden' as const,
  }), [tokens, isGlass]);
  const accentBar = useMemo(() => createAccentBarStyle(tokens, { position: 'top' }), [tokens]);
  const headerStyle = useMemo(() => ({
    ...createPanelHeaderStyle(tokens),
    display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const,
  }), [tokens]);
  const fieldContainerStyle = useMemo(() => ({
    ...createSurfaceStyle(tokens, { elevation: 'sm', glass: isGlass }),
    padding: tokens.spacing[2], transition: `all ${tokens.motion.hover}`,
  }), [tokens, isGlass]);
  const secureBadge = useMemo(() => createBadgeStyle(tokens, 'success'), [tokens]);
  const brandBadgeBase = useMemo(() => createBadgeStyle(tokens, 'primary'), [tokens]);

  const submitBaseStyle = useMemo(() => ({
    width: '100%' as const,
    padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
    borderRadius: tokens.borderRadius.md,
    border: 'none' as const,
    color: tokens.colors.common.white,
    fontSize: tokens.typography.fontSize.md,
    fontWeight: tokens.typography.fontWeight.semibold,
    cursor: 'pointer' as const,
    transition: `all ${tokens.motion.hover}`,
    background: `linear-gradient(135deg, ${tokens.colors.primaryScale[500]}, ${tokens.colors.primaryScale[700]})`,
    boxShadow: tokens.shadows.sm,
    transform: submitHover ? tokens.motion.transform : 'none',
    opacity: processing ? 0.7 : 1,
  }), [tokens, submitHover, processing]);

  const brandColors: Record<string, string> = useMemo(() => ({
    visa: tokens.colors.infoScale[600],
    mastercard: tokens.colors.errorScale[500],
    amex: tokens.colors.primaryScale[600],
    discover: tokens.colors.warningScale[500],
  }), [tokens]);

  const labelStyle = useMemo(() => ({
    fontSize: tokens.typography.fontSize.xs,
    color: tokens.colors.neutral[500],
    marginBottom: tokens.spacing[1],
    fontWeight: tokens.typography.fontWeight.medium,
  }), [tokens]);

  const handleChange = (field: keyof PaymentData, val: string) => {
    let formatted = val;
    if (field === 'cardNumber') {
      formatted = val.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
    } else if (field === 'expiry') {
      formatted = val.replace(/\D/g, '');
      if (formatted.length >= 2) formatted = formatted.slice(0, 2) + '/' + formatted.slice(2, 4);
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
    if (processing) return;
    setProcessing(true);
    try { onSubmit?.(formData); } finally { setProcessing(false); }
  };

  const getFieldStyle = (fieldName: string) => ({
    ...fieldContainerStyle,
    ...(hoveredField === fieldName ? { boxShadow: tokens.shadows.md } : {}),
    ...(focusedField === fieldName ? focusRing.focus : {}),
  });

  const renderField = (field: keyof PaymentData, label: string, placeholder: string, opts?: {
    type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search'; required?: boolean; extra?: React.CSSProperties;
  }) => (
    <Box
      style={{ ...getFieldStyle(field), ...opts?.extra }}
      onMouseEnter={() => setHoveredField(field)}
      onMouseLeave={() => setHoveredField(null)}
    >
      <Text style={labelStyle}>{label}</Text>
      <Input
        value={formData[field]}
        onChange={(value: string | number) => handleChange(field, value as string)}
        onFocus={() => setFocusedField(field)}
        onBlur={() => setFocusedField(null)}
        placeholder={placeholder}
        type={opts?.type}
        required={opts?.required}
        size="sm"
        style={{ width: '100%' }}
      />
    </Box>
  );

  return (
    <form onSubmit={handleSubmit} className={className} style={style}>
      <Box style={containerStyle}>
        <Box style={accentBar} />
        <Box style={headerStyle}>
          <Text style={{
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[800],
          }}>
            Payment
          </Text>
          <Box style={secureBadge}>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.successScale[700] }}>
              Secure
            </Text>
          </Box>
        </Box>

        <Box style={{ padding: tokens.spacing[3] }}>
          <Flex gap={4} style={{ marginBottom: tokens.spacing[3] }}>
            {brands.map((brand) => (
              <Box key={brand} style={{
                ...brandBadgeBase,
                backgroundColor: tokens.colors.neutral[50],
                borderColor: tokens.colors.neutral[200],
                color: brandColors[brand] || tokens.colors.neutral[600],
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.bold,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
              }}>
                {brand.slice(0, 4).toUpperCase()}
              </Box>
            ))}
          </Flex>

          {renderField('name', 'Cardholder Name', 'Full Name')}
          {renderField('cardNumber', 'Card Number', '1234 5678 9012 3456', {
            required: true, extra: { marginTop: tokens.spacing[2] },
          })}

          <Flex gap={8} style={{ marginTop: tokens.spacing[2] }}>
            <Box style={{ flex: 1 }}>
              {renderField('expiry', 'Expiry', 'MM/YY', { required: true })}
            </Box>
            <Box style={{ flex: 1 }}>
              {renderField('cvc', 'CVC', '123', { type: 'password', required: true })}
            </Box>
          </Flex>

          {onSubmit && (
            <button
              type="submit"
              disabled={processing}
              style={{ ...submitBaseStyle, marginTop: tokens.spacing[3] }}
              onMouseEnter={() => setSubmitHover(true)}
              onMouseLeave={() => setSubmitHover(false)}
            >
              <Flex align="center" justify="center" gap={8}>
                {processing && <Spinner size="sm" />}
                <Text style={{
                  color: tokens.colors.common.white,
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.semibold,
                }}>
                  {processing ? 'Processing...' : 'Pay Now'}
                </Text>
              </Flex>
            </button>
          )}
        </Box>
      </Box>
    </form>
  );
});

CompactPreset.displayName = 'PaymentFormCompactPreset';
