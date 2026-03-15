'use client';

import React from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createFilterPillStyle,
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

export const StorefrontEvMerchStore = createPreset<EvMerchStoreProps>({
  name: 'MerchStore.Storefront',
  render: (ctx: PresetContext<EvMerchStoreProps>) => {
    const { primitives, props, tokens } = ctx;
    const { Box, Text } = primitives;

    const {
      products: rawProducts = MOCK_PRODUCTS,
      onProductClick,
      onAddToCart,
    } = props;

    const products = Array.isArray(rawProducts) ? rawProducts : MOCK_PRODUCTS;

    const categories = Array.from(new Set(products.map((p) => p.category)));

    const getStatusBadgeColor = (status: MerchProduct['status']): 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary' => {
      switch (status) {
        case 'active':
          return 'success';
        case 'low-stock':
          return 'warning';
        case 'out-of-stock':
          return 'error';
        case 'discontinued':
          return 'secondary';
        default:
          return 'secondary';
      }
    };

    const getStatusLabel = (status: MerchProduct['status']) => {
      switch (status) {
        case 'active':
          return 'In Stock';
        case 'low-stock':
          return 'Low Stock';
        case 'out-of-stock':
          return 'Out of Stock';
        case 'discontinued':
          return 'Discontinued';
        default:
          return status;
      }
    };

    const getCategoryGradient = (category: string) => {
      switch (category) {
        case 'apparel':
          return `linear-gradient(135deg, ${tokens.colors.primaryScale[500]}, ${tokens.colors.primaryScale[700]})`;
        case 'accessories':
          return `linear-gradient(135deg, ${tokens.colors.secondaryScale[500]}, ${tokens.colors.secondaryScale[700]})`;
        case 'prints':
          return `linear-gradient(135deg, ${tokens.colors.successScale[500]}, ${tokens.colors.successScale[700]})`;
        default:
          return `linear-gradient(135deg, ${tokens.colors.neutral[500]}, ${tokens.colors.neutral[700]})`;
      }
    };

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
        <Box
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: tokens.spacing[3],
          }}
        >
          <Box>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
                marginBottom: tokens.spacing[1],
              }}
            >
              Merchandise Store
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
              }}
            >
              Official event merchandise and collectibles
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
              Total Items
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}
            >
              {products.length}
            </Text>
          </Box>
        </Box>

        {/* Search Bar */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[3],
            padding: tokens.spacing[3],
            backgroundColor: tokens.colors.common.white,
            borderRadius: tokens.borderRadius.md,
            border: `1px solid ${tokens.colors.neutral[200]}`,
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.lg,
              color: tokens.colors.neutral[400],
            }}
          >
            🔍
          </Text>
          <input
            type="text"
            placeholder="Search merchandise..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[900],
              backgroundColor: 'transparent',
            }}
          />
        </Box>

        {/* Category Filters */}
        <Box style={{ display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap' }}>
          <Box
            style={{
              ...createFilterPillStyle(tokens, { active: true }),
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
              }}
            >
              All
            </Text>
          </Box>
          {categories.map((category) => (
            <Box
              key={category}
              style={{
                ...createFilterPillStyle(tokens, { active: false }),
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  textTransform: 'capitalize',
                }}
              >
                {category}
              </Text>
            </Box>
          ))}
        </Box>

        {/* Product Grid */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: tokens.spacing[4],
          }}
        >
          {products.map((product) => {
            const statusBadgeColor = getStatusBadgeColor(product.status);
            const isAvailable = product.status === 'active' || product.status === 'low-stock';

            return (
              <Box
                key={product.id}
                style={{
                  ...createCardStyle(tokens),
                  ...createHoverStyle(tokens),
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
                onClick={() => onProductClick?.(product.id)}
              >
                {/* Product Image Placeholder */}
                <Box
                  style={{
                    height: '200px',
                    background: getCategoryGradient(product.category),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize['3xl'],
                      color: tokens.colors.common.white,
                    }}
                  >
                    {product.category === 'apparel'
                      ? '👕'
                      : product.category === 'accessories'
                      ? '🧢'
                      : '🖼️'}
                  </Text>
                  {/* Status Badge */}
                  <Box
                    style={{
                      position: 'absolute',
                      top: tokens.spacing[2],
                      right: tokens.spacing[2],
                      ...createBadgeStyle(tokens, statusBadgeColor),
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.medium,
                      }}
                    >
                      {getStatusLabel(product.status)}
                    </Text>
                  </Box>
                </Box>

                {/* Product Details */}
                <Box
                  style={{
                    padding: tokens.spacing[3],
                    display: 'flex',
                    flexDirection: 'column',
                    gap: tokens.spacing[2],
                    flex: 1,
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
                        textTransform: 'capitalize',
                      }}
                    >
                      {product.category}
                    </Text>
                  </Box>

                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xl,
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.neutral[900],
                      }}
                    >
                      {'$'}{product.basePrice.toFixed(2)}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                      }}
                    >
                      {product.variants.length} variant
                      {product.variants.length !== 1 ? 's' : ''}
                    </Text>
                  </Box>

                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: tokens.spacing[2],
                      borderTop: `1px solid ${tokens.colors.neutral[200]}`,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[400],
                      }}
                    >
                      {product.totalStock} in stock
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[400],
                      }}
                    >
                      {product.totalSold} sold
                    </Text>
                  </Box>

                  {/* Add to Cart Button */}
                  <Box
                    style={{
                      marginTop: tokens.spacing[2],
                      padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                      backgroundColor: isAvailable
                        ? tokens.colors.primaryScale[500]
                        : tokens.colors.neutral[300],
                      borderRadius: tokens.borderRadius.md,
                      textAlign: 'center',
                      cursor: isAvailable ? 'pointer' : 'not-allowed',
                      transition: 'background-color 0.2s',
                      opacity: isAvailable ? 1 : 0.6,
                    }}
                    onClick={(e: any) => {
                      e.stopPropagation();
                      if (isAvailable) {
                        onAddToCart?.(product.id, product.variants[0]?.id || '');
                      }
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.common.white,
                      }}
                    >
                      {isAvailable ? 'Add to Cart' : 'Unavailable'}
                    </Text>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Stats Summary */}
        <Box
          style={{
            ...createCardStyle(tokens),
            padding: tokens.spacing[3],
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: tokens.spacing[3],
          }}
        >
          <Box>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[1],
              }}
            >
              Total Stock
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}
            >
              {products.reduce((sum, p) => sum + p.totalStock, 0)}
            </Text>
          </Box>
          <Box>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[1],
              }}
            >
              Total Sold
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.successScale[600],
              }}
            >
              {products.reduce((sum, p) => sum + p.totalSold, 0)}
            </Text>
          </Box>
          <Box>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[1],
              }}
            >
              Revenue
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.primaryScale[600],
              }}
            >
              $
              {products
                .reduce((sum, p) => sum + p.basePrice * p.totalSold, 0)
                .toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
            </Text>
          </Box>
          <Box>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[1],
              }}
            >
              Low Stock Items
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.warningScale[600],
              }}
            >
              {products.filter((p) => p.status === 'low-stock').length}
            </Text>
          </Box>
        </Box>
      </Box>
    );
  },
});
