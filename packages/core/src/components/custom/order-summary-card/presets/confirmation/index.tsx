'use client';

import React from 'react';
import { createPreset } from '../../../factory';
import type { OrderSummaryCardProps } from '../../core';
import {
  createCardStyle,
} from '../../../helpers';

export default createPreset<OrderSummaryCardProps>((context) => {
  const { primitives, props, tokens, engine } = context;
  const isGlass = engine === 'modern' && !!tokens.glass;
  const { Box, Text } = primitives;
  const { orderId, items, total, shippingAddress, estimatedDelivery, className, style } = props;

  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (date?: Date | string): string => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <Box
      className={className}
      style={{ ...createCardStyle(tokens, { glass: isGlass, elevation: 'md' }), ...style, padding: tokens.spacing[8] }}
    >
      {/* Success Header */}
      <Box style={{ textAlign: 'center', marginBottom: tokens.spacing[8] }}>
        <Box
          style={{
            width: '64px',
            height: '64px',
            margin: `0 auto ${tokens.spacing[4]}`,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: tokens.colors.successScale[100],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
          }}
        >
          ✓
        </Box>
        <Text
          style={{
            fontSize: tokens.typography.fontSize['2xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
            marginBottom: tokens.spacing[1],
          }}
        >
          Order Confirmed!
        </Text>
        <Text
          style={{
            fontSize: tokens.typography.fontSize.md,
            color: tokens.colors.neutral[600],
          }}
        >
          Order #{orderId}
        </Text>
      </Box>

      {/* Items */}
      <Box
        style={{
          marginBottom: tokens.spacing[6],
          paddingBottom: tokens.spacing[6],
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        }}
      >
        {items.map((item, idx) => (
          <Box
            key={idx}
            style={{
              display: 'flex',
              gap: tokens.spacing[4],
              marginBottom: tokens.spacing[4],
            }}
          >
            {item.image && (
              <Box
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: tokens.borderRadius.md,
                  backgroundImage: `url(${item.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: tokens.colors.neutral[100],
                  flexShrink: 0,
                }}
              />
            )}
            <Box style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[900],
                }}
              >
                {item.name}
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[600],
                  marginTop: tokens.spacing[1],
                }}
              >
                Qty: {item.quantity}
              </Text>
            </Box>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.md,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
              }}
            >
              {formatCurrency(item.price * item.quantity)}
            </Text>
          </Box>
        ))}
      </Box>

      {/* Total */}
      <Box
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: tokens.spacing[6],
          paddingBottom: tokens.spacing[6],
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        }}
      >
        <Text
          style={{
            fontSize: tokens.typography.fontSize.lg,
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
          }}
        >
          Total
        </Text>
        <Text
          style={{
            fontSize: tokens.typography.fontSize.xl,
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
          }}
        >
          {formatCurrency(total)}
        </Text>
      </Box>

      {/* Shipping Address */}
      {shippingAddress && (
        <Box style={{ marginBottom: tokens.spacing[6] }}>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
              marginBottom: tokens.spacing[2],
            }}
          >
            Shipping Address
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[700],
              lineHeight: tokens.typography.lineHeight.relaxed,
            }}
          >
            {shippingAddress}
          </Text>
        </Box>
      )}

      {/* Estimated Delivery */}
      {estimatedDelivery && (
        <Box
          style={{
            padding: tokens.spacing[4],
            backgroundColor: tokens.colors.primaryScale[50],
            borderRadius: tokens.borderRadius.md,
            textAlign: 'center',
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[700],
            }}
          >
            Estimated Delivery
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.primaryScale[700],
              marginTop: tokens.spacing[1],
            }}
          >
            {formatDate(estimatedDelivery)}
          </Text>
        </Box>
      )}
    </Box>
  );
});
