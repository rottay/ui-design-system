'use client';

/**
 * EvBarPos - SelfService Preset
 * Customer-facing kiosk with large product tiles, simplified cart, quick checkout
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
  { id: 'p8', name: 'Water Bottle', category: 'Non-Alcoholic', price: 3.00, currency: 'USD', isAvailable: true, isCombo: false },
  { id: 'p9', name: 'Red Bull', category: 'Non-Alcoholic', price: 5.00, currency: 'USD', isAvailable: true, isCombo: false },
  { id: 'p10', name: 'Party Pack', category: 'Combos', price: 45.00, currency: 'USD', isAvailable: true, isCombo: true },
];

const MOCK_CART: CartItem[] = [
  { productId: 'p2', productName: 'Mojito', quantity: 1, unitPrice: 13.00, total: 13.00 },
  { productId: 'p4', productName: 'Corona Extra', quantity: 2, unitPrice: 7.00, total: 14.00 },
];

const CATEGORY_EMOJIS: Record<string, string> = {
  'Cocktails': '\uD83C\uDF78',
  'Beer': '\uD83C\uDF7A',
  'Spirits': '\uD83E\uDD43',
  'Non-Alcoholic': '\uD83E\uDDC3',
  'Combos': '\uD83C\uDF89',
};

const PRODUCT_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
];

export const SelfServiceEvBarPos = createPreset<EvBarPosProps>({
  name: 'EvBarPos.SelfService',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvBarPosProps>) => {
    const { Box, Text } = primitives;
    const { products: propProducts, cart: propCart, total: propTotal, onAddToCart, onRemoveFromCart, onCheckout, className, style } = props;

    const products = propProducts && propProducts.length > 0 ? propProducts : MOCK_PRODUCTS;
    const cart = propCart && propCart.length > 0 ? propCart : MOCK_CART;

    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
    const [showCart, setShowCart] = useState(false);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const categories = useMemo(() => [...new Set(products.map(p => p.category))], [products]);

    const filteredProducts = useMemo(() => {
      return products.filter(p => {
        if (!p.isAvailable) return false;
        if (activeCategory && p.category !== activeCategory) return false;
        return true;
      });
    }, [products, activeCategory]);

    const cartTotal = propTotal || cart.reduce((s, i) => s + i.total, 0);
    const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
    const tax = cartTotal * 0.08;
    const grandTotal = cartTotal + tax;

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[900], padding: tokens.spacing[5], ...style }}>
        {/* Header - Kiosk Style */}
        <div style={{ textAlign: 'center' as const, marginBottom: tokens.spacing[5] }}>
          <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.common.white, display: 'block', marginBottom: tokens.spacing[1] }}>
            {'\uD83C\uDF7B'} Order Here
          </Text>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>
            Tap a drink to add to your order
          </Text>
        </div>

        {/* Category Tabs - Large Touch */}
        <div style={{ display: 'flex', gap: tokens.spacing[2], marginBottom: tokens.spacing[5], justifyContent: 'center', flexWrap: 'wrap' as const }}>
          <div onClick={() => setActiveCategory(null)}
            style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`, borderRadius: tokens.borderRadius.lg, backgroundColor: activeCategory === null ? tokens.colors.primaryScale[600] : tokens.colors.neutral[800], color: activeCategory === null ? tokens.colors.common.white : tokens.colors.neutral[300], fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', border: `1px solid ${activeCategory === null ? tokens.colors.primaryScale[500] : tokens.colors.neutral[700]}` }}>
            {'\uD83C\uDF79'} All
          </div>
          {categories.map(cat => (
            <div key={cat} onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`, borderRadius: tokens.borderRadius.lg, backgroundColor: activeCategory === cat ? tokens.colors.primaryScale[600] : tokens.colors.neutral[800], color: activeCategory === cat ? tokens.colors.common.white : tokens.colors.neutral[300], fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', border: `1px solid ${activeCategory === cat ? tokens.colors.primaryScale[500] : tokens.colors.neutral[700]}` }}>
              {CATEGORY_EMOJIS[cat] || '\uD83C\uDF79'} {cat}
            </div>
          ))}
        </div>

        {/* Product Grid - Large Tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[4], marginBottom: tokens.spacing[5] }}>
          {filteredProducts.map((product, idx) => {
            const isHovered = hoveredProduct === product.id;
            const inCart = cart.find(c => c.productId === product.id);
            return (
              <div key={product.id} onClick={() => onAddToCart?.(product.id)}
                onMouseEnter={() => setHoveredProduct(product.id)} onMouseLeave={() => setHoveredProduct(null)}
                style={{ borderRadius: tokens.borderRadius.lg, overflow: 'hidden', cursor: 'pointer', position: 'relative' as const, ...hoverStyle, ...(isHovered ? getHoverTransform(tokens) : {}) }}>
                {/* Gradient top */}
                <div style={{ height: 80, background: PRODUCT_GRADIENTS[idx % PRODUCT_GRADIENTS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' as const }}>
                  <span style={{ fontSize: 36 }}>{CATEGORY_EMOJIS[product.category] || '\uD83C\uDF79'}</span>
                  {inCart && (
                    <div style={{ position: 'absolute' as const, top: tokens.spacing[2], right: tokens.spacing[2], width: 28, height: 28, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.successScale[500], color: tokens.colors.common.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold }}>
                      {inCart.quantity}
                    </div>
                  )}
                  {product.isCombo && (
                    <div style={{ position: 'absolute' as const, top: tokens.spacing[2], left: tokens.spacing[2] }}>
                      <span style={createBadgeStyle(tokens, 'warning')}>{'\uD83C\uDF89'} Combo</span>
                    </div>
                  )}
                </div>
                {/* Info */}
                <div style={{ padding: tokens.spacing[3], backgroundColor: tokens.colors.neutral[800], textAlign: 'center' as const }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.common.white, display: 'block', marginBottom: tokens.spacing[1] }}>
                    {product.name}
                  </Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[400] }}>
                    ${product.price.toFixed(2)}
                  </Text>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center' as const, padding: tokens.spacing[10] }}>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2], color: tokens.colors.neutral[500] }}>{'\uD83C\uDF79'}</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[400], display: 'block' }}>No items in this category</Text>
          </div>
        )}

        {/* Cart Summary - Fixed at bottom */}
        <div style={{ backgroundColor: tokens.colors.neutral[800], borderRadius: tokens.borderRadius.lg, padding: tokens.spacing[4], border: `1px solid ${tokens.colors.neutral[700]}` }}>
          <div onClick={() => setShowCart(!showCart)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: showCart ? tokens.spacing[3] : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
              <div style={{ width: 40, height: 40, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[600], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.common.white }}>{cartCount}</Text>
              </div>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.common.white }}>
                {'\uD83D\uDED2'} Your Order
              </Text>
            </div>
            <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[400] }}>
              ${grandTotal.toFixed(2)}
            </Text>
          </div>

          {showCart && (
            <>
              {cart.map((item, idx) => (
                <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `${tokens.spacing[2]}px 0`, borderTop: `1px solid ${tokens.colors.neutral[700]}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>{item.quantity}x</span>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[200] }}>{item.productName}</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[200] }}>${item.total.toFixed(2)}</Text>
                    <button onClick={(e) => { e.stopPropagation(); onRemoveFromCart?.(item.productId); }} style={{ width: 24, height: 24, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.errorScale[800], color: tokens.colors.errorScale[300], border: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>{'\u2212'}</button>
                  </div>
                </div>
              ))}
              <div style={{ borderTop: `1px solid ${tokens.colors.neutral[600]}`, paddingTop: tokens.spacing[2], marginTop: tokens.spacing[2], display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Subtotal: ${cartTotal.toFixed(2)} + Tax: ${tax.toFixed(2)}</Text>
              </div>
            </>
          )}

          <button onClick={onCheckout} style={{ width: '100%', padding: `${tokens.spacing[4]}px`, backgroundColor: tokens.colors.successScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.lg, fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, cursor: 'pointer', fontFamily: 'inherit', marginTop: tokens.spacing[3], ...hoverStyle }}>
            {'\uD83D\uDCB3'} Checkout - ${grandTotal.toFixed(2)}
          </button>
        </div>
      </Box>
    );
  },
});
