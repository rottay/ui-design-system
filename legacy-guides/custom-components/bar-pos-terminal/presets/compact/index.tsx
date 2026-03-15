'use client';

/**
 * BarPosTerminal - Compact Preset
 * Minimal POS layout for small screens or embedded use
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createFilterPillStyle,
  getHoverTransform,
} from '../../../helpers';
import type { BarPosTerminalProps, PosProduct, CartItem } from '../../core';

const MOCK_PRODUCTS: PosProduct[] = [
  { id: 'p1', name: 'Margarita', category: 'Cocktails', price: 14.00, currency: 'USD', isAvailable: true },
  { id: 'p2', name: 'Mojito', category: 'Cocktails', price: 13.00, currency: 'USD', isAvailable: true },
  { id: 'p3', name: 'Corona Extra', category: 'Beer', price: 7.00, currency: 'USD', isAvailable: true },
  { id: 'p4', name: 'Heineken', category: 'Beer', price: 7.50, currency: 'USD', isAvailable: true },
  { id: 'p5', name: 'Red Bull', category: 'Non-Alcoholic', price: 5.00, currency: 'USD', isAvailable: true },
  { id: 'p6', name: 'Water', category: 'Non-Alcoholic', price: 3.00, currency: 'USD', isAvailable: true },
];

const MOCK_CART: CartItem[] = [
  { productId: 'p1', productName: 'Margarita', quantity: 2, unitPrice: 14.00, total: 28.00 },
  { productId: 'p3', productName: 'Corona Extra', quantity: 1, unitPrice: 7.00, total: 7.00 },
];

export const CompactBarPosTerminal = createPreset<BarPosTerminalProps>({
  name: 'BarPosTerminal.Compact',
  render: ({ primitives, props, tokens }: PresetContext<BarPosTerminalProps>) => {
    const { Box, Text } = primitives;
    const { products: propProducts, cart: propCart, total: propTotal, onAddToCart, onRemoveFromCart, onCheckout, className, style } = props;

    const products = propProducts && propProducts.length > 0 ? propProducts : MOCK_PRODUCTS;
    const cart = propCart && propCart.length > 0 ? propCart : MOCK_CART;

    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm' }), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const categories = useMemo(() => [...new Set(products.map(p => p.category))], [products]);
    const filteredProducts = useMemo(() => {
      return products.filter(p => !activeCategory || p.category === activeCategory);
    }, [products, activeCategory]);

    const cartTotal = propTotal || cart.reduce((s, i) => s + i.total, 0);
    const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[4], ...style }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
          <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
            POS Terminal
          </Text>
          <span style={createBadgeStyle(tokens, 'success')}>Online</span>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: tokens.spacing[2], marginBottom: tokens.spacing[3], flexWrap: 'wrap' as const }}>
          <div onClick={() => setActiveCategory(null)} style={createFilterPillStyle(tokens, { active: activeCategory === null })}>All</div>
          {categories.map(cat => (
            <div key={cat} onClick={() => setActiveCategory(activeCategory === cat ? null : cat)} style={createFilterPillStyle(tokens, { active: activeCategory === cat })}>{cat}</div>
          ))}
        </div>

        {/* Product Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}>
          {filteredProducts.map((product) => (
            <div key={product.id} onClick={() => product.isAvailable && onAddToCart?.(product.id)}
              onMouseEnter={() => setHoveredProduct(product.id)} onMouseLeave={() => setHoveredProduct(null)}
              style={{
                ...cardBase, padding: tokens.spacing[3], cursor: product.isAvailable ? 'pointer' : 'not-allowed',
                opacity: product.isAvailable ? 1 : 0.5, textAlign: 'center' as const, ...hoverStyle,
                ...(hoveredProduct === product.id && product.isAvailable ? getHoverTransform(tokens) : {}),
              }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>
                {product.name}
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600] }}>
                ${product.price.toFixed(2)}
              </Text>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div style={{ ...cardBase, padding: tokens.spacing[3] }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[800] }}>Cart ({cartCount})</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600] }}>${cartTotal.toFixed(2)}</Text>
          </div>
          {cart.map((item) => (
            <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', padding: `${tokens.spacing[1]}px 0`, fontSize: tokens.typography.fontSize.xs }}>
              <Text style={{ color: tokens.colors.neutral[700], fontSize: tokens.typography.fontSize.xs }}>{item.productName} x{item.quantity}</Text>
              <Text style={{ color: tokens.colors.neutral[900], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium }}>${item.total.toFixed(2)}</Text>
            </div>
          ))}
          <button onClick={onCheckout} style={{ width: '100%', marginTop: tokens.spacing[2], padding: `${tokens.spacing[2]}px`, backgroundColor: tokens.colors.successScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, cursor: 'pointer', fontFamily: 'inherit' }}>
            Pay ${cartTotal.toFixed(2)}
          </button>
        </div>
      </Box>
    );
  },
});
