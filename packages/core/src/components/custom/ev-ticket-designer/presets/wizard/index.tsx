'use client';

/**
 * EvTicketDesigner - Wizard Preset
 * Step-by-step ticket type creation with step indicator, form, perks, and price rules
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createSectionHeaderStyle } from '../../../helpers';
import type { EvTicketDesignerProps, TicketTypeConfig, PriceRule } from '../../core';

const MOCK_TYPES: TicketTypeConfig[] = [
  { id: '1', name: 'General Admission', description: 'Standard entry with access to main stage', price: 45, currency: 'USD', quantity: 2500, salesStart: new Date('2026-03-01'), salesEnd: new Date('2026-06-15'), isVip: false, perks: ['Main Stage Access', 'Food Court Access'] },
  { id: '2', name: 'VIP', description: 'Premium experience with lounge access', price: 120, currency: 'USD', quantity: 800, salesStart: new Date('2026-03-01'), salesEnd: new Date('2026-06-15'), isVip: true, perks: ['VIP Lounge', 'Premium Bar', 'Priority Entry', 'Meet & Greet'] },
  { id: '3', name: 'Backstage', description: 'Full backstage pass with artist access', price: 250, currency: 'USD', quantity: 200, salesStart: new Date('2026-03-01'), salesEnd: new Date('2026-06-15'), isVip: true, perks: ['Backstage Access', 'Artist Meet', 'Exclusive Merch', 'Free Parking', 'Complimentary Drinks'] },
];

const MOCK_RULES: PriceRule[] = [
  { id: '1', name: 'Early Bird', type: 'early-bird', discount: 20, validUntil: new Date('2026-04-01') },
  { id: '2', name: 'Group of 5+', type: 'group', discount: 15, validUntil: new Date('2026-06-15') },
  { id: '3', name: 'NEON2026', type: 'promo', discount: 10, validUntil: new Date('2026-05-01'), code: 'NEON2026' },
];

const STEPS = ['Type Details', 'Pricing & Perks', 'Price Rules', 'Review'];

export const WizardEvTicketDesigner = createPreset<EvTicketDesignerProps>({
  name: 'EvTicketDesigner.Wizard',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvTicketDesignerProps>) => {
    const { Box } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const sectionHeader = useMemo(() => createSectionHeaderStyle(tokens), [tokens]);

    const ticketTypes = props.ticketTypes ?? MOCK_TYPES;
    const priceRules = props.priceRules ?? MOCK_RULES;
    const [step, setStep] = useState(0);
    const [selectedType, setSelectedType] = useState(0);

    const current = ticketTypes[selectedType] ?? ticketTypes[0];

    const inputStyle = { width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontFamily: 'inherit', backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[900], boxSizing: 'border-box' as const };

    const ruleTypeColor = (t: string): 'success' | 'info' | 'warning' => t === 'early-bird' ? 'success' : t === 'group' ? 'info' : 'warning';

    return (
      <Box className={props.className} style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4], padding: tokens.spacing[4], backgroundColor: tokens.colors.neutral[50], height: '100%', overflow: 'auto', ...props.style }}>
        {/* Header */}
        <div>
          <h2 style={{ margin: 0, fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>Ticket Designer</h2>
          <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Create and configure ticket types</span>
        </div>

        {/* Step Indicator */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
          {STEPS.map((s, i) => (
            <Box key={i} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flex: i < STEPS.length - 1 ? 1 : 'none' }}>
              <Box onClick={() => setStep(i)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: tokens.borderRadius.full, cursor: 'pointer',
                backgroundColor: i <= step ? tokens.colors.primaryScale[600] : tokens.colors.neutral[200],
                color: i <= step ? tokens.colors.common.white : tokens.colors.neutral[500],
                fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold,
              }}>
                {i < step ? '\u2713' : i + 1}
              </Box>
              <span style={{ fontSize: tokens.typography.fontSize.sm, color: i === step ? tokens.colors.primaryScale[700] : tokens.colors.neutral[500], fontWeight: i === step ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal }}>{s}</span>
              {i < STEPS.length - 1 && <Box style={{ flex: 1, height: 2, backgroundColor: i < step ? tokens.colors.primaryScale[400] : tokens.colors.neutral[200], borderRadius: tokens.borderRadius.full }} />}
            </Box>
          ))}
        </Box>

        {/* Type selector tabs */}
        <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
          {ticketTypes.map((t, i) => (
            <button key={t.id} onClick={() => setSelectedType(i)} style={{
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${i === selectedType ? tokens.colors.primaryScale[400] : tokens.colors.neutral[200]}`,
              borderRadius: tokens.borderRadius.md, cursor: 'pointer', fontFamily: 'inherit',
              backgroundColor: i === selectedType ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
              color: i === selectedType ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
              fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium,
            }}>
              {t.isVip ? '\u2B50 ' : '\uD83C\uDFAB '}{t.name}
            </button>
          ))}
        </Box>

        {/* Step Content */}
        <Box style={cardBase}>
          {step === 0 && (
            <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
              <span style={sectionHeader}>Ticket Type Details</span>
              <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[3] }}>
                <div><label style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1] }}>Name</label><input readOnly value={current.name} style={inputStyle} /></div>
                <div><label style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1] }}>Quantity</label><input readOnly value={current.quantity} style={inputStyle} /></div>
              </Box>
              <div><label style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1] }}>Description</label><textarea readOnly value={current.description} style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} /></div>
              <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[3] }}>
                <div><label style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1] }}>Sales Start</label><input readOnly value={current.salesStart.toLocaleDateString()} style={inputStyle} /></div>
                <div><label style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1] }}>Sales End</label><input readOnly value={current.salesEnd.toLocaleDateString()} style={inputStyle} /></div>
              </Box>
            </Box>
          )}
          {step === 1 && (
            <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
              <span style={sectionHeader}>Pricing & Perks</span>
              <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[3] }}>
                <div><label style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1] }}>Price</label><input readOnly value={`$${current.price}`} style={inputStyle} /></div>
                <div><label style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1] }}>Currency</label><input readOnly value={current.currency} style={inputStyle} /></div>
              </Box>
              <div>
                <label style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[2] }}>Perks Included</label>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                  {current.perks.map((p, i) => (
                    <Box key={i} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.successScale[50], borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.successScale[200]}` }}>
                      <span style={{ color: tokens.colors.successScale[600] }}>{'\u2713'}</span>
                      <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{p}</span>
                    </Box>
                  ))}
                </Box>
              </div>
            </Box>
          )}
          {step === 2 && (
            <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
              <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={sectionHeader}>Price Rules</span>
                <button onClick={() => props.onAddPriceRule?.(MOCK_RULES[0])} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer' }}>+ Add Rule</button>
              </Box>
              {priceRules.map((rule) => (
                <Box key={rule.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                    <span style={{ fontSize: tokens.typography.fontSize.lg }}>{rule.type === 'early-bird' ? '\uD83D\uDC26' : rule.type === 'group' ? '\uD83D\uDC65' : '\uD83C\uDFF7\uFE0F'}</span>
                    <div>
                      <div style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{rule.name}</div>
                      <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Valid until {rule.validUntil.toLocaleDateString()}{rule.code ? ` \u2022 Code: ${rule.code}` : ''}</div>
                    </div>
                  </Box>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <span style={createBadgeStyle(tokens, ruleTypeColor(rule.type))}>{rule.type}</span>
                    <span style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600] }}>-{rule.discount}%</span>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
          {step === 3 && (
            <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
              <span style={sectionHeader}>Review - {current.name}</span>
              <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: tokens.spacing[3] }}>
                {[{ l: 'Base Price', v: `$${current.price}` }, { l: 'Quantity', v: current.quantity.toLocaleString() }, { l: 'Total Capacity Revenue', v: `$${(current.price * current.quantity).toLocaleString()}` }].map((item, i) => (
                  <Box key={i} style={{ padding: tokens.spacing[3], backgroundColor: tokens.colors.neutral[50], borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
                    <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{item.l}</div>
                    <div style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], marginTop: tokens.spacing[1] }}>{item.v}</div>
                  </Box>
                ))}
              </Box>
              <div style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                <strong>Perks:</strong> {current.perks.join(', ')}
              </div>
              <div style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                <strong>Active Rules:</strong> {priceRules.map(r => `${r.name} (-${r.discount}%)`).join(', ')}
              </div>
            </Box>
          )}
        </Box>

        {/* Navigation */}
        <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: 'transparent', color: step === 0 ? tokens.colors.neutral[300] : tokens.colors.neutral[600], border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`, borderRadius: tokens.borderRadius.md, cursor: step === 0 ? 'default' : 'pointer', fontSize: tokens.typography.fontSize.sm, fontFamily: 'inherit' }}>Back</button>
          <button onClick={() => step < 3 ? setStep(step + 1) : props.onSave?.(current)} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, cursor: 'pointer', fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, fontFamily: 'inherit' }}>
            {step < 3 ? 'Next' : 'Save Ticket Type'}
          </button>
        </Box>
      </Box>
    );
  },
});
