'use client';

import React from 'react';
import { createPreset } from '../../../factory';
import type { OrderSummaryCardProps } from '../../core';
import {
  createCardStyle,
  formatDistanceToNow,
} from '../../../helpers';

export default createPreset<OrderSummaryCardProps>((context) => {
  const { primitives, props, tokens, engine } = context;
  const isGlass = tokens.surface.useGlass && !!tokens.glass;
  const { Box, Text } = primitives;
  const { orderId, items, total, status, trackingSteps, shippingAddress, className, style } = props;

  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  const formatTimestamp = (timestamp?: Date | string): string => {
    if (!timestamp) return '';
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <Box
      className={className}
      style={{ ...createCardStyle(tokens, { glass: isGlass, elevation: 'md' }), ...style, padding: tokens.spacing[8] }}
    >
      {/* Header */}
      <Box style={{ marginBottom: tokens.spacing[8] }}>
        <Text
          style={{
            fontSize: tokens.typography.fontSize.xl,
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
            marginBottom: tokens.spacing[1],
          }}
        >
          Order Tracking
        </Text>
        <Text
          style={{
            fontSize: tokens.typography.fontSize.md,
            color: tokens.colors.neutral[600],
          }}
        >
          Order #{orderId}
        </Text>
        {status && (
          <Box
            style={{
              display: 'inline-block',
              marginTop: tokens.spacing[2],
              padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.infoScale[100],
              color: tokens.colors.infoScale[700],
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
            }}
          >
            {status}
          </Box>
        )}
      </Box>

      {/* Tracking Timeline */}
      {trackingSteps && trackingSteps.length > 0 && (
        <Box
          style={{
            marginBottom: tokens.spacing[8],
            paddingBottom: tokens.spacing[8],
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}
        >
          {trackingSteps.map((step, idx) => (
            <Box
              key={step.key}
              style={{
                position: 'relative',
                paddingLeft: '48px',
                paddingBottom: idx < trackingSteps.length - 1 ? tokens.spacing[6] : 0,
              }}
            >
              {/* Timeline Dot */}
              <Box
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: '32px',
                  height: '32px',
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor:
                    step.status === 'completed'
                      ? tokens.colors.successScale[600]
                      : step.status === 'current'
                      ? tokens.colors.primaryScale[600]
                      : tokens.colors.neutral[200],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: tokens.colors.common.white,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                }}
              >
                {step.status === 'completed' ? '✓' : idx + 1}
              </Box>

              {/* Timeline Line */}
              {idx < trackingSteps.length - 1 && (
                <Box
                  style={{
                    position: 'absolute',
                    left: '15px',
                    top: '36px',
                    width: '2px',
                    height: `calc(100% - 20px)`,
                    backgroundColor:
                      step.status === 'completed' ? tokens.colors.successScale[300] : tokens.colors.neutral[200],
                  }}
                />
              )}

              {/* Step Content */}
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight:
                    step.status === 'current' ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                  color:
                    step.status === 'upcoming' ? tokens.colors.neutral[500] : tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[1],
                }}
              >
                {step.label}
              </Text>
              {step.timestamp && (
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[600],
                  }}
                >
                  {formatTimestamp(step.timestamp)}
                </Text>
              )}
            </Box>
          ))}
        </Box>
      )}

      {/* Order Items */}
      <Box
        style={{
          marginBottom: tokens.spacing[6],
          paddingBottom: tokens.spacing[6],
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        }}
      >
        <Text
          style={{
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[900],
            marginBottom: tokens.spacing[4],
          }}
        >
          Order Items
        </Text>
        {items.map((item, idx) => (
          <Box
            key={idx}
            style={{
              display: 'flex',
              gap: tokens.spacing[2],
              marginBottom: tokens.spacing[2],
            }}
          >
            {item.image && (
              <Box
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: tokens.borderRadius.sm,
                  backgroundImage: `url(${item.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: tokens.colors.neutral[100],
                  flexShrink: 0,
                }}
              />
            )}
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[900],
                }}
              >
                {item.name}
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[600],
                }}
              >
                Qty: {item.quantity}
              </Text>
            </Box>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[900],
              }}
            >
              {formatCurrency(item.price * item.quantity)}
            </Text>
          </Box>
        ))}
      </Box>

      {/* Total & Address */}
      <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
        <Text
          style={{
            fontSize: tokens.typography.fontSize.md,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[900],
          }}
        >
          Total
        </Text>
        <Text
          style={{
            fontSize: tokens.typography.fontSize.md,
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
          }}
        >
          {formatCurrency(total)}
        </Text>
      </Box>

      {shippingAddress && (
        <Box>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
              marginBottom: tokens.spacing[1],
            }}
          >
            Shipping to
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[700],
            }}
          >
            {shippingAddress}
          </Text>
        </Box>
      )}
    </Box>
  );
});
