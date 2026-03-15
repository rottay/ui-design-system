'use client';

/**
 * EvTicketDesigner - Form Preset
 * All fields visible with pricing tiers table and promo code generator
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createSectionHeaderStyle } from '../../../helpers';
import type { EvTicketDesignerProps, TicketTypeConfig, PriceRule } from '../../core';

const MOCK_TYPES: TicketTypeConfig[] = [
  { id: '1', name: 'General Admission', description: 'Standard entry', price: 45, currency: 'USD', quantity: 2500, salesStart: new Date('2026-03-01'), salesEnd: new Date('2026-06-15'), isVip: false, perks: ['Main Stage Access', 'Food Court'] },
  { id: '2', name: 'VIP', description: 'Premium experience', price: 120, currency: 'USD', quantity: 800, salesStart: new Date('2026-03-01'), salesEnd: new Date('2026-06-15'), isVip: true, perks: ['VIP Lounge', 'Premium Bar', 'Priority Entry', 'Meet & Greet'] },
  { id: '3', name: 'Backstage', description: 'Artist access pass', price: 250, currency: 'USD', quantity: 200, salesStart: new Date('2026-03-01'), salesEnd: new Date('2026-06-15'), isVip: true, perks: ['Backstage Access', 'Artist Meet', 'Exclusive Merch', 'Free Parking', 'Complimentary Drinks'] },
  { id: '4', name: 'Early Bird', description: '20% off GA', price: 36, currency: 'USD', quantity: 500, salesStart: new Date('2026-02-15'), salesEnd: new Date('2026-03-15'), isVip: false, perks: ['Main Stage Access'] },
];

const MOCK_RULES: PriceRule[] = [
  { id: '1', name: 'Early Bird', type: 'early-bird', discount: 20, validUntil: new Date('2026-04-01') },
  { id: '2', name: 'Group 5+', type: 'group', discount: 15, validUntil: new Date('2026-06-15') },
  { id: '3', name: 'NEON2026', type: 'promo', discount: 10, validUntil: new Date('2026-05-01'), code: 'NEON2026' },
];

export const FormEvTicketDesigner = createPreset<EvTicketDesignerProps>({
  name: 'EvTicketDesigner.Form',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvTicketDesignerProps>) => {
    const { Box } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const sectionHeader = useMemo(() => createSectionHeaderStyle(tokens), [tokens]);

    const ticketTypes = props.ticketTypes ?? MOCK_TYPES;
    const priceRules = props.priceRules ?? MOCK_RULES;
    const [promoCode, setPromoCode] = useState('');

    const inputStyle = { width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontFamily: 'inherit', backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[900], boxSizing: 'border-box' as const };
    const thStyle = { textAlign: 'left' as const, padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], backgroundColor: tokens.colors.neutral[50], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` };
    const tdStyle = { padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` };

    const genCode = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let c = 'EV-';
      for (let i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)];
      setPromoCode(c);
    };

    return (
      <Box className={props.className} style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4], padding: tokens.spacing[4], backgroundColor: tokens.colors.neutral[50], height: '100%', overflow: 'auto', ...props.style }}>
        <div>
          <h2 style={{ margin: 0, fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>Ticket Configuration</h2>
          <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>All ticket types and pricing in one view</span>
        </div>

        {/* Pricing Tiers Table */}
        <Box style={cardBase}>
          <span style={{ ...sectionHeader, display: 'block', marginBottom: tokens.spacing[3] }}>Pricing Tiers</span>
          <Box style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                {['', 'Type', 'Description', 'Price', 'Qty', 'Sales Window', 'VIP', 'Perks'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {ticketTypes.map((t) => (
                  <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => props.onSave?.(t)}>
                    <td style={tdStyle}><span style={{ fontSize: tokens.typography.fontSize.lg }}>{t.isVip ? '\u2B50' : '\uD83C\uDFAB'}</span></td>
                    <td style={{ ...tdStyle, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{t.name}</td>
                    <td style={{ ...tdStyle, color: tokens.colors.neutral[500], maxWidth: 160 }}>{t.description}</td>
                    <td style={{ ...tdStyle, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>${t.price}</td>
                    <td style={tdStyle}>{t.quantity.toLocaleString()}</td>
                    <td style={{ ...tdStyle, fontSize: tokens.typography.fontSize.xs }}>{t.salesStart.toLocaleDateString()} - {t.salesEnd.toLocaleDateString()}</td>
                    <td style={tdStyle}>{t.isVip ? <span style={createBadgeStyle(tokens, 'warning')}>VIP</span> : <span style={{ color: tokens.colors.neutral[400] }}>-</span>}</td>
                    <td style={tdStyle}>
                      <Box style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[1] }}>
                        {t.perks.slice(0, 3).map((p, i) => (
                          <span key={i} style={{ ...createBadgeStyle(tokens, 'primary'), fontSize: tokens.typography.fontSize.xs }}>{p}</span>
                        ))}
                        {t.perks.length > 3 && <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>+{t.perks.length - 3}</span>}
                      </Box>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Box>

        <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[4] }}>
          {/* Price Rules */}
          <Box style={cardBase}>
            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[3] }}>
              <span style={sectionHeader}>Active Price Rules</span>
              <button onClick={() => props.onAddPriceRule?.(MOCK_RULES[0])} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit' }}>+ Add</button>
            </Box>
            {priceRules.map((r) => (
              <Box key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, marginBottom: tokens.spacing[2], borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <span>{r.type === 'early-bird' ? '\uD83D\uDC26' : r.type === 'group' ? '\uD83D\uDC65' : '\uD83C\uDFF7\uFE0F'}</span>
                  <div>
                    <div style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{r.name}</div>
                    <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Until {r.validUntil.toLocaleDateString()}</div>
                  </div>
                </Box>
                <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600] }}>-{r.discount}%</span>
              </Box>
            ))}
          </Box>

          {/* Promo Code Generator */}
          <Box style={cardBase}>
            <span style={{ ...sectionHeader, display: 'block', marginBottom: tokens.spacing[3] }}>Promo Code Generator</span>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
              <div>
                <label style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1] }}>Discount %</label>
                <input readOnly value="10" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1] }}>Max Uses</label>
                <input readOnly value="100" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1] }}>Valid Until</label>
                <input readOnly value="2026-05-01" style={inputStyle} />
              </div>
              <button onClick={genCode} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit', fontWeight: tokens.typography.fontWeight.medium }}>Generate Code</button>
              {promoCode && (
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: tokens.spacing[3], backgroundColor: tokens.colors.successScale[50], borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.successScale[200]}` }}>
                  <span style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[700], fontFamily: 'monospace', letterSpacing: '0.1em' }}>{promoCode}</span>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
