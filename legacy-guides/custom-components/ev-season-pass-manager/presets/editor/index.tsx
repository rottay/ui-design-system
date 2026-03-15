'use client';

/**
 * EvSeasonPassManager - Editor Preset
 * Single-pass editing view with benefits config, pricing, validity timeline, holder list
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createProgressBarStyle,
  createFilterPillStyle,
  getHoverTransform,
} from '../../../helpers';
import type { EvSeasonPassManagerProps, SeasonPassType, PassHolder } from '../../core';

const MOCK_PASS_TYPES: SeasonPassType[] = [
  { id: '1', name: 'Gold All-Access', description: 'Unlimited entry to all events including VIP areas', price: 599, validFrom: new Date('2026-01-01'), validUntil: new Date('2026-12-31'), includedEvents: 24, maxUses: 999, holdersCount: 342, status: 'active' },
  { id: '2', name: 'Silver Weekend', description: 'Weekend events only with standard seating', price: 349, validFrom: new Date('2026-01-01'), validUntil: new Date('2026-12-31'), includedEvents: 12, maxUses: 12, holdersCount: 518, status: 'active' },
  { id: '3', name: 'Bronze Single Venue', description: 'Arena Complex events only', price: 199, validFrom: new Date('2026-03-01'), validUntil: new Date('2026-09-30'), includedEvents: 8, maxUses: 8, holdersCount: 156, status: 'active' },
  { id: '4', name: 'VIP Platinum', description: 'All events + backstage access + meet & greet', price: 999, validFrom: new Date('2026-01-01'), validUntil: new Date('2026-12-31'), includedEvents: 24, maxUses: 999, holdersCount: 89, status: 'active' },
  { id: '5', name: 'Student Pass', description: 'Discounted student access to select events', price: 149, validFrom: new Date('2026-02-01'), validUntil: new Date('2026-08-31'), includedEvents: 6, maxUses: 6, holdersCount: 234, status: 'active' },
  { id: '6', name: 'Summer 2025', description: 'Last year summer series - expired', price: 299, validFrom: new Date('2025-06-01'), validUntil: new Date('2025-09-30'), includedEvents: 10, maxUses: 10, holdersCount: 412, status: 'expired' },
];

const MOCK_HOLDERS: PassHolder[] = [
  { id: 'h1', holderName: 'Sarah Connor', email: 'sarah@skynet.com', passType: 'Gold All-Access', usageCount: 18, maxUses: 999, validUntil: new Date('2026-12-31') },
  { id: 'h2', holderName: 'John Reese', email: 'john@resistance.io', passType: 'Gold All-Access', usageCount: 14, maxUses: 999, validUntil: new Date('2026-12-31') },
  { id: 'h3', holderName: 'Elena Diaz', email: 'elena.d@email.com', passType: 'Gold All-Access', usageCount: 22, maxUses: 999, validUntil: new Date('2026-12-31') },
  { id: 'h4', holderName: 'Derek Miles', email: 'derek.m@email.com', passType: 'Gold All-Access', usageCount: 12, maxUses: 999, validUntil: new Date('2026-12-31') },
  { id: 'h5', holderName: 'Nina Patel', email: 'nina.p@corp.com', passType: 'Gold All-Access', usageCount: 7, maxUses: 999, validUntil: new Date('2026-12-31') },
  { id: 'h6', holderName: 'Ava Chen', email: 'ava.chen@mail.com', passType: 'Gold All-Access', usageCount: 20, maxUses: 999, validUntil: new Date('2026-12-31') },
  { id: 'h7', holderName: 'Kyle Smith', email: 'kyle@email.com', passType: 'Gold All-Access', usageCount: 9, maxUses: 999, validUntil: new Date('2026-12-31') },
  { id: 'h8', holderName: 'Marcus Lee', email: 'marcus@inbox.com', passType: 'Gold All-Access', usageCount: 16, maxUses: 999, validUntil: new Date('2026-12-31') },
];

const BENEFITS = [
  { id: 'b1', name: 'Unlimited Event Entry', icon: '\uD83C\uDFAB', included: true },
  { id: 'b2', name: 'VIP Lounge Access', icon: '\uD83C\uDF78', included: true },
  { id: 'b3', name: 'Priority Seating', icon: '\uD83D\uDCBA', included: true },
  { id: 'b4', name: 'Free Parking', icon: '\uD83C\uDD7F\uFE0F', included: true },
  { id: 'b5', name: 'Backstage Access', icon: '\uD83C\uDFAD', included: false },
  { id: 'b6', name: 'Meet & Greet', icon: '\uD83E\uDD1D', included: false },
  { id: 'b7', name: 'Merchandise Discount', icon: '\uD83D\uDED2', included: true },
  { id: 'b8', name: 'Early Entry', icon: '\u26A1', included: true },
];

export const EditorEvSeasonPassManager = createPreset<EvSeasonPassManagerProps>({
  name: 'EvSeasonPassManager.Editor',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvSeasonPassManagerProps>) => {
    const { Box, Text } = primitives;

    const passTypes = props.passTypes ?? MOCK_PASS_TYPES;
    const holders = props.holders ?? MOCK_HOLDERS;
    const { onPassTypeClick, onHolderClick, onCreatePass, className, style } = props;

    const [selectedPassId, setSelectedPassId] = useState(passTypes[0]?.id ?? '1');
    const [holderSearch, setHolderSearch] = useState('');
    const [hoveredHolder, setHoveredHolder] = useState<string | null>(null);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const selectedPass = passTypes.find(p => p.id === selectedPassId) ?? passTypes[0];

    const passHolders = useMemo(() => {
      return holders.filter(h => {
        if (holderSearch && !h.holderName.toLowerCase().includes(holderSearch.toLowerCase()) && !h.email.toLowerCase().includes(holderSearch.toLowerCase())) return false;
        return true;
      });
    }, [holders, holderSearch]);

    const formatDate = (d: Date) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    };

    const daysRemaining = (d: Date) => Math.max(0, Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    const totalDays = (from: Date, to: Date) => Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = (from: Date) => Math.max(0, Math.ceil((Date.now() - from.getTime()) / (1000 * 60 * 60 * 24)));

    const validityPct = selectedPass ? Math.min(100, Math.round((elapsedDays(selectedPass.validFrom) / totalDays(selectedPass.validFrom, selectedPass.validUntil)) * 100)) : 0;
    const validityColor = validityPct >= 90 ? tokens.colors.errorScale[500] : validityPct >= 70 ? tokens.colors.warningScale[500] : tokens.colors.successScale[500];
    const validityBar = createProgressBarStyle(tokens, { percent: validityPct, color: validityColor });

    const avgUsage = passHolders.length > 0 ? Math.round(passHolders.reduce((s, h) => s + h.usageCount, 0) / passHolders.length) : 0;

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[4], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[4] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>
              Pass Editor
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Configure and manage pass types</Text>
          </div>
          <div onClick={onCreatePass} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', ...hoverStyle }}>
            + New Pass Type
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: tokens.spacing[4] }}>
          {/* Left sidebar - Pass type list */}
          <div style={{ ...cardBase, padding: tokens.spacing[2] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700], display: 'block', padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px ${tokens.spacing[3]}px` }}>
              Pass Types
            </Text>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
              {passTypes.map(pt => (
                <div
                  key={pt.id}
                  onClick={() => { setSelectedPassId(pt.id); onPassTypeClick?.(pt.id); }}
                  style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    cursor: 'pointer',
                    backgroundColor: selectedPassId === pt.id ? tokens.colors.primaryScale[50] : 'transparent',
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${selectedPassId === pt.id ? tokens.colors.primaryScale[200] : 'transparent'}`,
                    ...hoverStyle,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: selectedPassId === pt.id ? tokens.colors.primaryScale[700] : tokens.colors.neutral[900] }}>{pt.name}</Text>
                    <span style={createBadgeStyle(tokens, pt.status === 'active' ? 'success' : 'error')}>{pt.status}</span>
                  </div>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginTop: 2 }}>
                    ${pt.price} - {pt.holdersCount} holders
                  </Text>
                </div>
              ))}
            </div>
          </div>

          {/* Right content - Selected pass details */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
            {selectedPass && (
              <>
                {/* Pass Info Card */}
                <div style={{ ...cardBase }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: tokens.spacing[4] }}>
                    <div>
                      <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{selectedPass.name}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{selectedPass.description}</Text>
                    </div>
                    <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600] }}>${selectedPass.price}</Text>
                  </div>

                  {/* Quick stats row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
                    {[
                      { label: 'Holders', value: selectedPass.holdersCount.toLocaleString(), icon: '\uD83D\uDC65' },
                      { label: 'Events', value: selectedPass.includedEvents.toString(), icon: '\uD83C\uDFAA' },
                      { label: 'Max Uses', value: selectedPass.maxUses > 100 ? 'Unlimited' : selectedPass.maxUses.toString(), icon: '\uD83D\uDD04' },
                      { label: 'Avg Usage', value: `${avgUsage} uses`, icon: '\uD83D\uDCCA' },
                    ].map((s, i) => (
                      <div key={i} style={{ padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[50], border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, textAlign: 'center' as const }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.lg, display: 'block' }}>{s.icon}</Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{s.value}</Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{s.label}</Text>
                      </div>
                    ))}
                  </div>

                  {/* Validity Timeline */}
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700], display: 'block', marginBottom: tokens.spacing[2] }}>Validity Period</Text>
                  <div style={{ marginBottom: tokens.spacing[2] }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{formatDate(selectedPass.validFrom)}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: validityColor }}>{daysRemaining(selectedPass.validUntil)} days remaining</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{formatDate(selectedPass.validUntil)}</Text>
                    </div>
                    <div style={{ ...validityBar.track, height: 8 }}><div style={validityBar.fill} /></div>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], marginTop: 2 }}>{validityPct}% elapsed</Text>
                  </div>
                </div>

                {/* Benefits Card */}
                <div style={{ ...cardBase }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[3] }}>Benefits & Perks</Text>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: tokens.spacing[2] }}>
                    {BENEFITS.map(b => (
                      <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, backgroundColor: b.included ? tokens.colors.successScale[50] : tokens.colors.neutral[50], border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${b.included ? tokens.colors.successScale[200] : tokens.colors.neutral[200]}` }}>
                        <span style={{ fontSize: tokens.typography.fontSize.md }}>{b.icon}</span>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, color: b.included ? tokens.colors.successScale[700] : tokens.colors.neutral[400], fontWeight: b.included ? tokens.typography.fontWeight.medium : tokens.typography.fontWeight.normal, textDecoration: b.included ? 'none' : 'line-through' }}>{b.name}</Text>
                        {b.included && <span style={{ marginLeft: 'auto', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.successScale[600] }}>{'\u2713'}</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Holders List */}
                <div style={{ ...cardBase }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[3] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>Holders ({passHolders.length})</Text>
                    <input
                      type="text"
                      placeholder="Search holders..."
                      value={holderSearch}
                      onChange={(e) => setHolderSearch(e.target.value)}
                      style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none', width: 200 }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 0 }}>
                    {passHolders.map((h, idx) => {
                      const isHovered = hoveredHolder === h.id;
                      return (
                        <div
                          key={h.id}
                          onClick={() => onHolderClick?.(h.id)}
                          onMouseEnter={() => setHoveredHolder(h.id)}
                          onMouseLeave={() => setHoveredHolder(null)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: tokens.spacing[3],
                            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                            borderBottom: idx < passHolders.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
                            cursor: onHolderClick ? 'pointer' : 'default',
                            backgroundColor: isHovered ? tokens.colors.neutral[50] : 'transparent',
                            borderRadius: tokens.borderRadius.sm,
                          }}
                        >
                          <div style={{ width: 32, height: 32, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.primaryScale[700], fontWeight: tokens.typography.fontWeight.semibold, flexShrink: 0 }}>
                            {h.holderName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], display: 'block' }}>{h.holderName}</Text>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{h.email}</Text>
                          </div>
                          <div style={{ textAlign: 'right' as const }}>
                            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>{h.usageCount} uses</Text>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Valid: {formatDate(h.validUntil)}</Text>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {passHolders.length === 0 && (
                    <div style={{ textAlign: 'center' as const, padding: tokens.spacing[6], color: tokens.colors.neutral[400] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.md, display: 'block' }}>No holders found</Text>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </Box>
    );
  },
});
