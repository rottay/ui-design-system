'use client';

import {useState, useMemo} from 'react';
import { createPreset } from '../../../factory';
import {
  createEmptyStateStyle,
  createHoverStyle,
  createPanelHeaderStyle,
  createSurfaceStyle,
} from '../../../helpers';
import type { CartSummaryProps } from '../../core';
import { CART_SUMMARY_DEFAULTS } from '../../core';

export const PanelPreset = createPreset<CartSummaryProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text, Button, Input } = primitives;
  const {
    items,
    currency = CART_SUMMARY_DEFAULTS.currency,
    subtotal,
    tax,
    shipping,
    total,
    onQuantityChange,
    onRemove,
    onCheckout,
    onPromoApply,
    className,
    style,
  } = props;

  const [promoInput, setPromoInput] = useState('');

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
        gap: tokens.spacing[6],
        padding: tokens.spacing[8],
        minWidth: '400px',
        maxWidth: '500px',
        ...style,
      }}
    >
      {/* Header */}
      <Box
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: tokens.spacing[4],
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        }}
      >
        <Text
          style={{
            fontSize: tokens.typography.fontSize.xl,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[900],
          }}
        >
          Shopping Cart
        </Text>
        <Text
          style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[600],
          }}
        >
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </Text>
      </Box>

      {/* Items list */}
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing[4],
          maxHeight: '400px',
          overflowY: 'auto',
        }}
      >
        {items.map((item) => (
          <Box
            key={item.id}
            style={{
              display: 'flex',
              gap: tokens.spacing[4],
              padding: tokens.spacing[4],
              backgroundColor: tokens.colors.neutral[50],
              borderRadius: tokens.borderRadius.md,
            }}
          >
            {/* Image */}
            {item.image && (
              <Box
                style={{
                  width: '64px',
                  height: '64px',
                  minWidth: '64px',
                  backgroundColor: tokens.colors.neutral[100],
                  borderRadius: tokens.borderRadius.md,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {typeof item.image === 'string' ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  item.image
                )}
              </Box>
            )}

            {/* Details */}
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
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[900],
                }}
              >
                {item.name}
              </Text>
              {item.variant && (
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                  }}
                >
                  {item.variant}
                </Text>
              )}

              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: tokens.spacing[1],
                }}
              >
                {/* Quantity controls */}
                {onQuantityChange && (
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                      padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                      backgroundColor: tokens.colors.common.white,
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    }}
                  >
                    <button
                      onClick={() => onQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: tokens.colors.neutral[600],
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                        padding: 0,
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      −
                    </button>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[900],
                        minWidth: '20px',
                        textAlign: 'center',
                      }}
                    >
                      {item.quantity}
                    </Text>
                    <button
                      onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: tokens.colors.neutral[600],
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                        padding: 0,
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      +
                    </button>
                  </Box>
                )}

                {/* Price */}
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.md,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                  }}
                >
                  {formatPrice(item.price * item.quantity)}
                </Text>
              </Box>
            </Box>

            {/* Remove button */}
            {onRemove && (
              <button
                onClick={() => onRemove(item.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: tokens.colors.neutral[400],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  padding: tokens.spacing[1],
                  alignSelf: 'flex-start',
                }}
              >
                ×
              </button>
            )}
          </Box>
        ))}
      </Box>

      {/* Promo code */}
      {onPromoApply && (
        <Box
          style={{
            display: 'flex',
            gap: tokens.spacing[2],
          }}
        >
          <Input
            value={promoInput}
            onChange={(value) => setPromoInput(value as string)}
            placeholder="Promo code"
            style={{
              flex: 1,
            }}
          />
          <Button
            onClick={() => {
              onPromoApply(promoInput);
              setPromoInput('');
            }}
          >
            Apply
          </Button>
        </Box>
      )}

      {/* Summary */}
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing[2],
          paddingTop: tokens.spacing[4],
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
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[600],
              }}
            >
              Tax
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[900],
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
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[600],
              }}
            >
              Shipping
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[900],
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
            paddingTop: tokens.spacing[2],
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
            }}
          >
            Total
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.lg,
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
            padding: tokens.spacing[4],
          }}
        >
          Proceed to Checkout
        </Button>
      )}
    </Box>
  );
});
