'use client';

import React from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
} from '../../../helpers';
import type { EvMerchStoreProps, MerchProduct, MerchVariant } from '../../core';

const MOCK_PRODUCTS: MerchProduct[] = [
  {
    id: '1',
    name: 'Event T-Shirt 2026',
    category: 'apparel',
    basePrice: 29.99,
    variants: [
      { id: 'v1', size: 'S', color: 'Black', stock: 45, sold: 15, sku: 'TS-BLK-S' },
      { id: 'v2', size: 'M', color: 'Black', stock: 12, sold: 38, sku: 'TS-BLK-M' },
      { id: 'v3', size: 'L', color: 'Black', stock: 28, sold: 22, sku: 'TS-BLK-L' },
      { id: 'v4', size: 'XL', color: 'Black', stock: 35, sold: 15, sku: 'TS-BLK-XL' },
      { id: 'v5', size: 'S', color: 'White', stock: 40, sold: 10, sku: 'TS-WHT-S' },
      { id: 'v6', size: 'M', color: 'White', stock: 8, sold: 42, sku: 'TS-WHT-M' },
    ],
    totalStock: 168,
    totalSold: 142,
    status: 'active',
  },
  {
    id: '2',
    name: 'Premium Hoodie',
    category: 'apparel',
    basePrice: 59.99,
    variants: [
      { id: 'v7', size: 'M', color: 'Navy', stock: 18, sold: 12, sku: 'HD-NVY-M' },
      { id: 'v8', size: 'L', color: 'Navy', stock: 22, sold: 8, sku: 'HD-NVY-L' },
      { id: 'v9', size: 'XL', color: 'Navy', stock: 15, sold: 5, sku: 'HD-NVY-XL' },
      { id: 'v10', size: 'M', color: 'Gray', stock: 3, sold: 17, sku: 'HD-GRY-M' },
    ],
    totalStock: 58,
    totalSold: 42,
    status: 'low-stock',
  },
  {
    id: '3',
    name: 'Logo Baseball Cap',
    category: 'accessories',
    basePrice: 24.99,
    variants: [
      { id: 'v11', color: 'Black', stock: 55, sold: 25, sku: 'CAP-BLK' },
      { id: 'v12', color: 'Navy', stock: 48, sold: 12, sku: 'CAP-NVY' },
      { id: 'v13', color: 'Red', stock: 6, sold: 34, sku: 'CAP-RED' },
    ],
    totalStock: 109,
    totalSold: 71,
    status: 'active',
  },
  {
    id: '4',
    name: 'Commemorative Poster',
    category: 'prints',
    basePrice: 19.99,
    variants: [
      { id: 'v14', size: '18x24', stock: 120, sold: 30, sku: 'PST-1824' },
      { id: 'v15', size: '24x36', stock: 85, sold: 15, sku: 'PST-2436' },
    ],
    totalStock: 205,
    totalSold: 45,
    status: 'active',
  },
  {
    id: '5',
    name: 'Festival Wristbands',
    category: 'accessories',
    basePrice: 9.99,
    variants: [
      { id: 'v16', color: 'Rainbow', stock: 0, sold: 200, sku: 'WB-RBW' },
      { id: 'v17', color: 'Glow', stock: 0, sold: 150, sku: 'WB-GLW' },
    ],
    totalStock: 0,
    totalSold: 350,
    status: 'out-of-stock',
  },
  {
    id: '6',
    name: 'Die-Cut Sticker Pack',
    category: 'prints',
    basePrice: 12.99,
    variants: [
      { id: 'v18', stock: 250, sold: 50, sku: 'STK-PCK' },
    ],
    totalStock: 250,
    totalSold: 50,
    status: 'active',
  },
];

export const InventoryEvMerchStore = createPreset<EvMerchStoreProps>({
  name: 'MerchStore.Inventory',
  render: (ctx: PresetContext<EvMerchStoreProps>) => {
    const { primitives, props, tokens } = ctx;
    const { Box, Text } = primitives;

    const { products = MOCK_PRODUCTS, onReorder, onProductClick } = props;

    const lowStockThreshold = 20;
    const criticalStockThreshold = 10;

    const getStockColor = (stock: number) => {
      if (stock === 0) return tokens.colors.errorScale[500];
      if (stock <= criticalStockThreshold) return tokens.colors.errorScale[400];
      if (stock <= lowStockThreshold) return tokens.colors.warningScale[400];
      return tokens.colors.successScale[400];
    };

    const getStockIntensity = (stock: number, maxStock: number) => {
      if (stock === 0) return 0;
      const intensity = stock / maxStock;
      return Math.max(0.2, Math.min(1, intensity));
    };

    const lowStockVariants = products.flatMap((product) =>
      product.variants
        .filter((v) => v.stock > 0 && v.stock <= lowStockThreshold)
        .map((v) => ({ ...v, productName: product.name, productId: product.id }))
    );

    const outOfStockVariants = products.flatMap((product) =>
      product.variants
        .filter((v) => v.stock === 0)
        .map((v) => ({ ...v, productName: product.name, productId: product.id }))
    );

    const totalInventoryValue = products.reduce(
      (sum, p) => sum + p.basePrice * p.totalStock,
      0
    );

    return (
      <Box
        style={{
          padding: tokens.spacing[4],
          backgroundColor: tokens.colors.neutral[50],
          borderRadius: tokens.borderRadius.lg,
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing[4],
          height: '100%',
          overflow: 'auto',
        }}
      >
        {/* Header */}
        <Box>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
              marginBottom: tokens.spacing[1],
            }}
          >
            Inventory Management
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
            }}
          >
            Track stock levels across all product variants
          </Text>
        </Box>

        {/* KPI Cards */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: tokens.spacing[3],
          }}
        >
          <Box
            style={{
              ...createCardStyle(tokens),
              padding: tokens.spacing[3],
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[1],
              }}
            >
              Total Inventory
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}
            >
              {products.reduce((sum, p) => sum + p.totalStock, 0)}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[400],
              }}
            >
              Units available
            </Text>
          </Box>
          <Box
            style={{
              ...createCardStyle(tokens),
              padding: tokens.spacing[3],
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[1],
              }}
            >
              Inventory Value
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}
            >
              {'$'}{totalInventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[400],
              }}
            >
              At retail price
            </Text>
          </Box>
          <Box
            style={{
              ...createCardStyle(tokens),
              padding: tokens.spacing[3],
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[1],
              }}
            >
              Low Stock Alerts
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.warningScale[600],
              }}
            >
              {lowStockVariants.length}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[400],
              }}
            >
              Variants need restock
            </Text>
          </Box>
          <Box
            style={{
              ...createCardStyle(tokens),
              padding: tokens.spacing[3],
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[1],
              }}
            >
              Out of Stock
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.errorScale[600],
              }}
            >
              {outOfStockVariants.length}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[400],
              }}
            >
              Variants unavailable
            </Text>
          </Box>
        </Box>

        {/* Stock Matrix */}
        <Box
          style={{
            ...createCardStyle(tokens),
            padding: tokens.spacing[3],
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
              marginBottom: tokens.spacing[3],
            }}
          >
            Stock Matrix
          </Text>
          <Box style={{ overflowX: 'auto' }}>
            {products.map((product) => {
              const maxVariantStock = Math.max(...product.variants.map((v) => v.stock));

              return (
                <Box
                  key={product.id}
                  style={{
                    marginBottom: tokens.spacing[4],
                    paddingBottom: tokens.spacing[4],
                    borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
                  }}
                >
                  {/* Product Header */}
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: tokens.spacing[3],
                    }}
                  >
                    <Box>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.md,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[900],
                          marginBottom: tokens.spacing[1],
                        }}
                      >
                        {product.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                        }}
                      >
                        Total: {product.totalStock} in stock, {product.totalSold} sold
                      </Text>
                    </Box>
                    <Box
                      style={{
                        padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                        backgroundColor: tokens.colors.primaryScale[500],
                        borderRadius: tokens.borderRadius.md,
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                      }}
                      onClick={() => onReorder?.(product.id)}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.common.white,
                        }}
                      >
                        Reorder
                      </Text>
                    </Box>
                  </Box>

                  {/* Variant Grid */}
                  <Box
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                      gap: tokens.spacing[2],
                    }}
                  >
                    {product.variants.map((variant) => {
                      const stockColor = getStockColor(variant.stock);
                      const intensity = getStockIntensity(variant.stock, maxVariantStock);

                      return (
                        <Box
                          key={variant.id}
                          style={{
                            padding: tokens.spacing[2],
                            backgroundColor: `${stockColor}${Math.floor(intensity * 255)
                              .toString(16)
                              .padStart(2, '0')}`,
                            borderRadius: tokens.borderRadius.md,
                            border: `1px solid ${stockColor}`,
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                          }}
                          onClick={() => onProductClick?.(product.id)}
                        >
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.semibold,
                              color: tokens.colors.neutral[900],
                              marginBottom: tokens.spacing[1],
                            }}
                          >
                            {variant.size || variant.color || 'Standard'}
                          </Text>
                          {variant.size && variant.color && (
                            <Text
                              style={{
                                fontSize: tokens.typography.fontSize.xs,
                                color: tokens.colors.neutral[500],
                                marginBottom: tokens.spacing[1],
                              }}
                            >
                              {variant.color}
                            </Text>
                          )}
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.lg,
                              fontWeight: tokens.typography.fontWeight.bold,
                              color:
                                variant.stock === 0
                                  ? tokens.colors.errorScale[700]
                                  : tokens.colors.neutral[900],
                            }}
                          >
                            {variant.stock}
                          </Text>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.neutral[400],
                            }}
                          >
                            {variant.sold} sold
                          </Text>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Low Stock Alerts */}
        {lowStockVariants.length > 0 && (
          <Box
            style={{
              ...createCardStyle(tokens),
              padding: tokens.spacing[3],
              backgroundColor: tokens.colors.warningScale[50],
              border: `1px solid ${tokens.colors.warningScale[200]}`,
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.md,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.warningScale[800],
                marginBottom: tokens.spacing[3],
              }}
            >
              Low Stock Alerts
            </Text>
            <Box
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: tokens.spacing[2],
              }}
            >
              {lowStockVariants.map((variant) => (
                <Box
                  key={variant.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: tokens.spacing[2],
                    backgroundColor: tokens.colors.common.white,
                    borderRadius: tokens.borderRadius.md,
                    border: `1px solid ${tokens.colors.warningScale[300]}`,
                  }}
                >
                  <Box>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[900],
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      {variant.productName}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                      }}
                    >
                      {variant.size && `Size: ${variant.size}`}
                      {variant.size && variant.color && ' • '}
                      {variant.color && `Color: ${variant.color}`}
                    </Text>
                  </Box>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                    <Box
                      style={{
                        ...createBadgeStyle(tokens, 'warning'),
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.semibold,
                        }}
                      >
                        {variant.stock} left
                      </Text>
                    </Box>
                    <Box
                      style={{
                        padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                        backgroundColor: tokens.colors.primaryScale[500],
                        borderRadius: tokens.borderRadius.md,
                        cursor: 'pointer',
                      }}
                      onClick={() => onReorder?.(variant.productId)}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.common.white,
                        }}
                      >
                        Reorder
                      </Text>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Out of Stock Items */}
        {outOfStockVariants.length > 0 && (
          <Box
            style={{
              ...createCardStyle(tokens),
              padding: tokens.spacing[3],
              backgroundColor: tokens.colors.errorScale[50],
              border: `1px solid ${tokens.colors.errorScale[200]}`,
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.md,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.errorScale[800],
                marginBottom: tokens.spacing[3],
              }}
            >
              Out of Stock Items
            </Text>
            <Box
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: tokens.spacing[2],
              }}
            >
              {outOfStockVariants.map((variant) => (
                <Box
                  key={variant.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: tokens.spacing[2],
                    backgroundColor: tokens.colors.common.white,
                    borderRadius: tokens.borderRadius.md,
                    border: `1px solid ${tokens.colors.errorScale[300]}`,
                  }}
                >
                  <Box>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[900],
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      {variant.productName}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                      }}
                    >
                      {variant.size && `Size: ${variant.size}`}
                      {variant.size && variant.color && ' • '}
                      {variant.color && `Color: ${variant.color}`} • SKU: {variant.sku}
                    </Text>
                  </Box>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[400],
                      }}
                    >
                      {variant.sold} sold
                    </Text>
                    <Box
                      style={{
                        padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                        backgroundColor: tokens.colors.errorScale[600],
                        borderRadius: tokens.borderRadius.md,
                        cursor: 'pointer',
                      }}
                      onClick={() => onReorder?.(variant.productId)}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.common.white,
                        }}
                      >
                        Urgent Reorder
                      </Text>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    );
  },
});
