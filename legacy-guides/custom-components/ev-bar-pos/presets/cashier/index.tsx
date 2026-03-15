'use client';

/**
 * EvBarPos - Cashier Preset
 * Full POS interface with product grid, category tabs, cart panel, payment totals
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createFilterPillStyle,
  createProgressBarStyle,
  getHoverTransform,
} from '../../../helpers';
import type { EvBarPosProps, PosProduct, CartItem } from '../../core';

const MOCK_PRODUCTS: PosProduct[] = [
  { id: 'p1', name: 'Margarita', category: 'Cocktails', price: 14.00, currency: 'USD', isAvailable: true, isCombo: false },
  { id: 'p2', name: 'Mojito', category: 'Cocktails', price: 13.00, currency: 'USD', isAvailable: true, isCombo: false },
  { id: 'p3', name: 'Old Fashioned', category: 'Cocktails', price: 15.00, currency: 'USD', isAvailable: true, isCombo: false },
  { id: 'p4', name: 'Corona Extra', category: 'Beer', price: 7.00, currency: 'USD', isAvailable: true, isCombo: false },
  { id: 'p5', name: 'Heineken', category: 'Beer', price: 7.50, currency: 'USD', isAvailable: true, isCombo: false },
  { id: 'p6', name: 'Craft IPA', category: 'Beer', price: 9.00, currency: 'USD', isAvailable: false, isCombo: false },
  { id: 'p7', name: 'Red Bull Vodka', category: 'Spirits', price: 12.00, currency: 'USD', isAvailable: true, isCombo: false },
  { id: 'p8', name: 'Whiskey Sour', category: 'Cocktails', price: 14.00, currency: 'USD', isAvailable: true, isCombo: false },
  { id: 'p9', name: 'Water Bottle', category: 'Non-Alcoholic', price: 3.00, currency: 'USD', isAvailable: true, isCombo: false },
  { id: 'p10', name: 'Red Bull', category: 'Non-Alcoholic', price: 5.00, currency: 'USD', isAvailable: true, isCombo: false },
  { id: 'p11', name: 'Party Combo', category: 'Combos', price: 45.00, currency: 'USD', isAvailable: true, isCombo: true },
  { id: 'p12', name: 'Nachos', category: 'Food', price: 10.00, currency: 'USD', isAvailable: true, isCombo: false },
];

const MOCK_CART: CartItem[] = [
  { productId: 'p1', productName: 'Margarita', quantity: 2, unitPrice: 14.00, total: 28.00 },
  { productId: 'p4', productName: 'Corona Extra', quantity: 3, unitPrice: 7.00, total: 21.00 },
  { productId: 'p10', productName: 'Red Bull', quantity: 1, unitPrice: 5.00, total: 5.00 },
];

const CATEGORY_ICONS: Record<string, string> = {
  'All': '\uD83C\uDF79',
  'Cocktails': '\uD83C\uDF78',
  'Beer': '\uD83C\uDF7A',
  'Spirits': '\uD83E\uDD43',
  'Non-Alcoholic': '\uD83E\uDDC3',
  'Combos': '\uD83C\uDF89',
  'Food': '\uD83C\uDF54',
};

export const CashierEvBarPos = createPreset<EvBarPosProps>({
  name: 'EvBarPos.Cashier',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvBarPosProps>) => {
    const { Box, Text } = primitives;
    const { products: propProducts, cart: propCart, total: propTotal, onAddToCart, onRemoveFromCart, onCheckout, className, style } = props;

    const products = propProducts && propProducts.length > 0 ? propProducts : MOCK_PRODUCTS;
    const cart = propCart && propCart.length > 0 ? propCart : MOCK_CART;

    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const categories = useMemo(() => {
      const cats = [...new Set(products.map(p => p.category))];
      return cats;
    }, [products]);

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
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>
              {'\uD83C\uDF79'} Bar POS - Cashier
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {filteredProducts.length} products available - {cartCount} items in cart
            </Text>
          </div>
          <span style={createBadgeStyle(tokens, 'success')}>{'\uD83D\uDFE2'} Register Open</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: tokens.spacing[5] }}>
          {/* Left: Products */}
          <div>
            {/* Search & Category Filters */}
            <div style={{ ...cardBase, marginBottom: tokens.spacing[4], padding: tokens.spacing[4] }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], flexWrap: 'wrap' as const }}>
                <div style={{ flex: 1, minWidth: 180, position: 'relative' as const }}>
                  <div style={{ position: 'absolute' as const, left: tokens.spacing[3], top: '50%', transform: 'translateY(-50%)', color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>{'\uD83D\uDD0D'}</div>
                  <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap' as const }}>
                  <div onClick={() => setActiveCategory(null)} style={createFilterPillStyle(tokens, { active: activeCategory === null })}>{'\uD83C\uDF79'} All</div>
                  {categories.map(cat => (
                    <div key={cat} onClick={() => setActiveCategory(activeCategory === cat ? null : cat)} style={createFilterPillStyle(tokens, { active: activeCategory === cat })}>
                      {CATEGORY_ICONS[cat] || '\uD83C\uDF79'} {cat}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Grid */}
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
                      borderLeft: product.isCombo ? `3px solid ${tokens.colors.warningScale[500]}` : 'none',
                    }}>
                    <div style={{ fontSize: 28, marginBottom: tokens.spacing[2] }}>
                      {CATEGORY_ICONS[product.category] || '\uD83C\uDF79'}
                    </div>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>
                      {product.name}
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600], display: 'block', marginBottom: tokens.spacing[1] }}>
                      ${product.price.toFixed(2)}
                    </Text>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: tokens.spacing[1] }}>
                      <span style={createBadgeStyle(tokens, product.isAvailable ? 'success' : 'error')}>
                        {product.isAvailable ? 'In Stock' : 'Out'}
                      </span>
                      {product.isCombo && <span style={createBadgeStyle(tokens, 'warning')}>{'\uD83C\uDF89'} Combo</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty state */}
            {filteredProducts.length === 0 && (
              <div style={{ textAlign: 'center' as const, padding: tokens.spacing[10], color: tokens.colors.neutral[400] }}>
                <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>{'\uD83C\uDF79'}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], display: 'block' }}>No products match your search</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>Try a different category or search term</Text>
              </div>
            )}
          </div>

          {/* Right: Cart */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
            <div style={{ ...cardBase, padding: 0, overflow: 'hidden', flex: 1 }}>
              <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.primaryScale[50], borderBottom: `1px solid ${tokens.colors.primaryScale[200]}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[800] }}>{'\uD83D\uDED2'} Cart ({cartCount})</Text>
              </div>

              {cart.length === 0 ? (
                <div style={{ padding: tokens.spacing[6], textAlign: 'center' as const }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>Cart is empty</Text>
                </div>
              ) : (
                <div>
                  {cart.map((item, idx) => (
                    <div key={item.productId} style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: idx < cart.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', ...hoverStyle }}>
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

            {/* Totals */}
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

            {/* Payment Buttons */}
            <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
              <button onClick={onCheckout} style={{ flex: 1, padding: `${tokens.spacing[3]}px`, backgroundColor: tokens.colors.successScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.lg, fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, cursor: 'pointer', fontFamily: 'inherit', ...hoverStyle }}>
                {'\uD83D\uDCB3'} Pay ${grandTotal.toFixed(2)}
              </button>
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
              <button style={{ flex: 1, padding: `${tokens.spacing[2]}px`, backgroundColor: tokens.colors.primaryScale[100], color: tokens.colors.primaryScale[700], border: `1px solid ${tokens.colors.primaryScale[300]}`, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', fontFamily: 'inherit' }}>
                {'\uD83D\uDCB5'} Cash
              </button>
              <button style={{ flex: 1, padding: `${tokens.spacing[2]}px`, backgroundColor: tokens.colors.infoScale[100], color: tokens.colors.infoScale[700], border: `1px solid ${tokens.colors.infoScale[300]}`, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', fontFamily: 'inherit' }}>
                {'\uD83D\uDCB3'} Card
              </button>
              <button style={{ flex: 1, padding: `${tokens.spacing[2]}px`, backgroundColor: tokens.colors.warningScale[100], color: tokens.colors.warningScale[700], border: `1px solid ${tokens.colors.warningScale[300]}`, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', fontFamily: 'inherit' }}>
                {'\uD83D\uDCF1'} Tab
              </button>
            </div>
          </div>
        </div>

        {/* Summary Bar */}
        <div style={{ ...cardBase, marginTop: tokens.spacing[5], display: 'flex', justifyContent: 'space-around', padding: tokens.spacing[3] }}>
          {[
            { label: 'Products', value: products.filter(p => p.isAvailable).length.toString(), emoji: '\uD83C\uDF79' },
            { label: 'Cart Items', value: cartCount.toString(), emoji: '\uD83D\uDED2' },
            { label: 'Subtotal', value: `$${cartTotal.toFixed(2)}`, emoji: '\uD83D\uDCB0' },
            { label: 'Grand Total', value: `$${grandTotal.toFixed(2)}`, emoji: '\uD83D\uDCB3' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, display: 'block' }}>{stat.emoji}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{stat.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{stat.label}</Text>
            </div>
          ))}
        </div>
      </Box>
    );
  },
});
