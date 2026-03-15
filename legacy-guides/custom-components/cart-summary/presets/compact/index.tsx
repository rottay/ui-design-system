'use client';

import {useState, useMemo} from 'react';
import { createPreset } from '../../../factory';
import {
  createHoverStyle,
  createSurfaceStyle,
} from '../../../helpers';
import type { CartSummaryProps } from '../../core';
import { CART_SUMMARY_DEFAULTS } from '../../core';

export const CompactPreset = createPreset<CartSummaryProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text, Button } = primitives;
  const {
    items,
    currency = CART_SUMMARY_DEFAULTS.currency,
    subtotal,
    tax,
    shipping,
    total,
    onCheckout,
    className,
    style,
  } = props;

  const [isExpanded, setIsExpanded] = useState(false);

  const surfaceStyle = useMemo(() => createSurfaceStyle(tokens), [tokens]);

  const formatPrice = (amount: number) => `${currency}${amount.toFixed(2)}`;

  const calculatedSubtotal = subtotal ?? items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const calculatedTotal = total ?? calculatedSubtotal + (tax ?? 0) + (shipping ?? 0);

  return (
    <Box
      className={className}
      style={{
        ...surfaceStyle,
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing[4],
        padding: tokens.spacing[6],
        minWidth: '300px',
        ...style,
      }}
    >
      {/* Collapsed view */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: `all ${tokens.motion.hover}`,
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
            }}
          >
            Cart
          </Text>
          <Box
            style={{
              padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
              backgroundColor: tokens.colors.primaryScale[100],
              color: tokens.colors.primaryScale[700],
              borderRadius: tokens.borderRadius.full,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
            }}
          >
            {items.length}
          </Box>
        </Box>

        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
            }}
          >
            {formatPrice(calculatedTotal)}
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[400],
              transition: `transform ${tokens.transitions?.normal || tokens.motion.hover}`,
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            ▼
          </Text>
        </Box>
      </Box>

      {/* Expanded view */}
      {isExpanded && (
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacing[4],
            paddingTop: tokens.spacing[4],
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}
        >
          {/* Items list */}
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.spacing[2],
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          >
            {items.map((item) => (
              <Box
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                }}
              >
                <Box
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: tokens.spacing[1],
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[900],
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
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
                  {formatPrice(item.price * item.quantity)}
                </Text>
              </Box>
            ))}
          </Box>

          {/* Summary */}
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.spacing[1],
              paddingTop: tokens.spacing[2],
              borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            }}
          >
            <Box
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[600],
                }}
              >
                Subtotal
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[900],
                }}
              >
                {formatPrice(calculatedSubtotal)}
              </Text>
            </Box>

            {tax !== undefined && (
              <Box
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                  }}
                >
                  Tax
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[700],
                  }}
                >
                  {formatPrice(tax)}
                </Text>
              </Box>
            )}

            {shipping !== undefined && (
              <Box
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                  }}
                >
                  Shipping
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[700],
                  }}
                >
                  {formatPrice(shipping)}
                </Text>
              </Box>
            )}

            <Box
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: tokens.spacing[1],
                borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              }}
            >
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
                {formatPrice(calculatedTotal)}
              </Text>
            </Box>
          </Box>

          {/* Checkout button */}
          {onCheckout && (
            <Button
              onClick={onCheckout}
              disabled={items.length === 0}
              style={{
                width: '100%',
              }}
            >
              Checkout
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
});
