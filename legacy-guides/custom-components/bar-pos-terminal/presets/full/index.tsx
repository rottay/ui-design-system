'use client';

/**
 * BarPosTerminal - Full Preset
 * Full POS interface with product grid, detailed cart, payment options
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
  { id: 'p3', name: 'Old Fashioned', category: 'Cocktails', price: 15.00, currency: 'USD', isAvailable: true },
  { id: 'p4', name: 'Corona Extra', category: 'Beer', price: 7.00, currency: 'USD', isAvailable: true },
  { id: 'p5', name: 'Heineken', category: 'Beer', price: 7.50, currency: 'USD', isAvailable: true },
  { id: 'p6', name: 'Craft IPA', category: 'Beer', price: 9.00, currency: 'USD', isAvailable: false },
  { id: 'p7', name: 'Red Bull Vodka', category: 'Spirits', price: 12.00, currency: 'USD', isAvailable: true },
  { id: 'p8', name: 'Whiskey Sour', category: 'Cocktails', price: 14.00, currency: 'USD', isAvailable: true },
  { id: 'p9', name: 'Water', category: 'Non-Alcoholic', price: 3.00, currency: 'USD', isAvailable: true },
  { id: 'p10', name: 'Red Bull', category: 'Non-Alcoholic', price: 5.00, currency: 'USD', isAvailable: true },
  { id: 'p11', name: 'Nachos', category: 'Food', price: 10.00, currency: 'USD', isAvailable: true },
  { id: 'p12', name: 'Wings', category: 'Food', price: 12.00, currency: 'USD', isAvailable: true },
];

const MOCK_CART: CartItem[] = [
  { productId: 'p1', productName: 'Margarita', quantity: 2, unitPrice: 14.00, total: 28.00 },
  { productId: 'p4', productName: 'Corona Extra', quantity: 3, unitPrice: 7.00, total: 21.00 },
  { productId: 'p10', productName: 'Red Bull', quantity: 1, unitPrice: 5.00, total: 5.00 },
];

export const FullBarPosTerminal = createPreset<BarPosTerminalProps>({
  name: 'BarPosTerminal.Full',
  render: ({ primitives, props, tokens }: PresetContext<BarPosTerminalProps>) => {
    const { Box, Text } = primitives;
    const { products: propProducts, cart: propCart, total: propTotal, onAddToCart, onRemoveFromCart, onCheckout, onClearCart, className, style } = props;

    const products = propProducts && propProducts.length > 0 ? propProducts : MOCK_PRODUCTS;
    const cart = propCart && propCart.length > 0 ? propCart : MOCK_CART;

    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm' }), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const categories = useMemo(() => [...new Set(products.map(p => p.category))], [products]);
    const filteredProducts = useMemo(() => {
      return products.filter(p => {
        if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (activeCategory && p.category !== activeCategory) return false;
        return true;
      });
    }, [products, searchTerm, activeCategory]);

    const cartTotal = propTotal || cart.reduce((s, i) => s + i.total, 0);
    const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
    const taxRate = 0.08;
    const tax = cartTotal * taxRate;
    const grandTotal = cartTotal + tax;

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>
              Bar POS Terminal
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {filteredProducts.length} products available - {cartCount} items in cart
            </Text>
          </div>
          <span style={createBadgeStyle(tokens, 'success')}>Register Open</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: tokens.spacing[5] }}>
          {/* Left: Products */}
          <div>
            <div style={{ ...cardBase, marginBottom: tokens.spacing[4], padding: tokens.spacing[4] }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], flexWrap: 'wrap' as const }}>
                <div style={{ flex: 1, minWidth: 180, position: 'relative' as const }}>
                  <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap' as const }}>
                  <div onClick={() => setActiveCategory(null)} style={createFilterPillStyle(tokens, { active: activeCategory === null })}>All</div>
                  {categories.map(cat => (
                    <div key={cat} onClick={() => setActiveCategory(activeCategory === cat ? null : cat)} style={createFilterPillStyle(tokens, { active: activeCategory === cat })}>{cat}</div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[3] }}>
              {filteredProducts.map((product) => {
                const isHovered = hoveredProduct === product.id;
                return (
                  <div key={product.id} onClick={() => product.isAvailable && onAddToCart?.(product.id)}
                    onMouseEnter={() => setHoveredProduct(product.id)} onMouseLeave={() => setHoveredProduct(null)}
                    style={{
                      ...cardBase, padding: tokens.spacing[4], cursor: product.isAvailable ? 'pointer' : 'not-allowed',
                      opacity: product.isAvailable ? 1 : 0.5, textAlign: 'center' as const, ...hoverStyle,
                      ...(isHovered && product.isAvailable ? getHoverTransform(tokens) : {}),
                    }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>
                      {product.name}
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600], display: 'block', marginBottom: tokens.spacing[1] }}>
                      ${product.price.toFixed(2)}
                    </Text>
                    <span style={createBadgeStyle(tokens, product.isAvailable ? 'success' : 'error')}>
                      {product.isAvailable ? 'In Stock' : 'Out'}
                    </span>
                  </div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div style={{ textAlign: 'center' as const, padding: tokens.spacing[10], color: tokens.colors.neutral[400] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], display: 'block' }}>No products match your search</Text>
              </div>
            )}
          </div>

          {/* Right: Cart */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
            <div style={{ ...cardBase, padding: 0, overflow: 'hidden', flex: 1 }}>
              <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.primaryScale[50], borderBottom: `1px solid ${tokens.colors.primaryScale[200]}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[800] }}>Cart ({cartCount})</Text>
                <button onClick={onClearCart} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, backgroundColor: 'transparent', color: tokens.colors.errorScale[600], border: 'none', cursor: 'pointer', fontSize: tokens.typography.fontSize.xs, fontFamily: 'inherit' }}>Clear</button>
              </div>
              {cart.length === 0 ? (
                <div style={{ padding: tokens.spacing[6], textAlign: 'center' as const }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>Cart is empty</Text>
                </div>
              ) : (
                <div>
                  {cart.map((item, idx) => (
                    <div key={item.productId} style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: idx < cart.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800], display: 'block' }}>{item.productName}</Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>${item.unitPrice.toFixed(2)} x {item.quantity}</Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>${item.total.toFixed(2)}</Text>
                        <button onClick={() => onRemoveFromCart?.(item.productId)} style={{ width: 24, height: 24, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.errorScale[100], color: tokens.colors.errorScale[600], border: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{'\u2212'}</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ ...cardBase, padding: tokens.spacing[4] }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>Subtotal</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>${cartTotal.toFixed(2)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>Tax (8%)</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>${tax.toFixed(2)}</Text>
              </div>
              <div style={{ borderTop: `1px solid ${tokens.colors.neutral[200]}`, paddingTop: tokens.spacing[2], display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>Total</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600] }}>${grandTotal.toFixed(2)}</Text>
              </div>
            </div>

            <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
              <button onClick={onCheckout} style={{ flex: 1, padding: `${tokens.spacing[3]}px`, backgroundColor: tokens.colors.successScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.lg, fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, cursor: 'pointer', fontFamily: 'inherit' }}>
                Pay ${grandTotal.toFixed(2)}
              </button>
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
              <button style={{ flex: 1, padding: `${tokens.spacing[2]}px`, backgroundColor: tokens.colors.primaryScale[100], color: tokens.colors.primaryScale[700], border: `1px solid ${tokens.colors.primaryScale[300]}`, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', fontFamily: 'inherit' }}>Cash</button>
              <button style={{ flex: 1, padding: `${tokens.spacing[2]}px`, backgroundColor: tokens.colors.infoScale[100], color: tokens.colors.infoScale[700], border: `1px solid ${tokens.colors.infoScale[300]}`, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', fontFamily: 'inherit' }}>Card</button>
              <button style={{ flex: 1, padding: `${tokens.spacing[2]}px`, backgroundColor: tokens.colors.warningScale[100], color: tokens.colors.warningScale[700], border: `1px solid ${tokens.colors.warningScale[300]}`, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', fontFamily: 'inherit' }}>Tab</button>
            </div>
          </div>
        </div>
      </Box>
    );
  },
});
