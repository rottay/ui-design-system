'use client';

/**
 * EvSeasonPassManager - Overview Preset
 * Season pass dashboard with pass type cards, holder stats, usage tracking, validity timeline
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
import type { EvSeasonPassManagerProps, SeasonPassType, PassHolder } from '../../core';

const MOCK_PASS_TYPES: SeasonPassType[] = [
  { id: '1', name: 'Gold All-Access', description: 'Unlimited entry to all events', price: 599, validFrom: new Date('2026-01-01'), validUntil: new Date('2026-12-31'), includedEvents: 24, maxUses: 999, holdersCount: 342, status: 'active' },
  { id: '2', name: 'Silver Weekend', description: 'Weekend events only', price: 349, validFrom: new Date('2026-01-01'), validUntil: new Date('2026-12-31'), includedEvents: 12, maxUses: 12, holdersCount: 518, status: 'active' },
  { id: '3', name: 'Bronze Single Venue', description: 'Arena Complex events', price: 199, validFrom: new Date('2026-03-01'), validUntil: new Date('2026-09-30'), includedEvents: 8, maxUses: 8, holdersCount: 156, status: 'active' },
  { id: '4', name: 'VIP Platinum', description: 'All events + backstage + meet & greet', price: 999, validFrom: new Date('2026-01-01'), validUntil: new Date('2026-12-31'), includedEvents: 24, maxUses: 999, holdersCount: 89, status: 'active' },
  { id: '5', name: 'Student Pass', description: 'Discounted student access', price: 149, validFrom: new Date('2026-02-01'), validUntil: new Date('2026-08-31'), includedEvents: 6, maxUses: 6, holdersCount: 234, status: 'active' },
  { id: '6', name: 'Summer 2025', description: 'Last year summer series', price: 299, validFrom: new Date('2025-06-01'), validUntil: new Date('2025-09-30'), includedEvents: 10, maxUses: 10, holdersCount: 412, status: 'expired' },
];

const MOCK_HOLDERS: PassHolder[] = [
  { id: 'h1', holderName: 'Sarah Connor', email: 'sarah@skynet.com', passType: 'Gold All-Access', usageCount: 18, maxUses: 999, validUntil: new Date('2026-12-31') },
  { id: 'h2', holderName: 'John Reese', email: 'john@resistance.io', passType: 'Silver Weekend', usageCount: 9, maxUses: 12, validUntil: new Date('2026-12-31') },
  { id: 'h3', holderName: 'Elena Diaz', email: 'elena.d@email.com', passType: 'VIP Platinum', usageCount: 22, maxUses: 999, validUntil: new Date('2026-12-31') },
  { id: 'h4', holderName: 'Marcus Lee', email: 'marcus@inbox.com', passType: 'Bronze Single Venue', usageCount: 5, maxUses: 8, validUntil: new Date('2026-09-30') },
  { id: 'h5', holderName: 'Ava Chen', email: 'ava.chen@mail.com', passType: 'Student Pass', usageCount: 3, maxUses: 6, validUntil: new Date('2026-08-31') },
  { id: 'h6', holderName: 'Derek Miles', email: 'derek.m@email.com', passType: 'Gold All-Access', usageCount: 12, maxUses: 999, validUntil: new Date('2026-12-31') },
  { id: 'h7', holderName: 'Nina Patel', email: 'nina.p@corp.com', passType: 'Silver Weekend', usageCount: 11, maxUses: 12, validUntil: new Date('2026-12-31') },
  { id: 'h8', holderName: 'Kyle Smith', email: 'kyle@email.com', passType: 'VIP Platinum', usageCount: 15, maxUses: 999, validUntil: new Date('2026-12-31') },
];

const PASS_GRADIENTS = [
  'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
  'linear-gradient(135deg, #C0C0C0 0%, #A9A9A9 100%)',
  'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)',
  'linear-gradient(135deg, #E5E4E2 0%, #B0C4DE 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
];

export const OverviewEvSeasonPassManager = createPreset<EvSeasonPassManagerProps>({
  name: 'EvSeasonPassManager.Overview',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvSeasonPassManagerProps>) => {
    const { Box, Text } = primitives;

    const passTypes = props.passTypes ?? MOCK_PASS_TYPES;
    const holders = props.holders ?? MOCK_HOLDERS;
    const { onPassTypeClick, onHolderClick, onCreatePass, className, style } = props;

    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const filteredHolders = useMemo(() => {
      return holders.filter(h => {
        if (searchTerm && !h.holderName.toLowerCase().includes(searchTerm.toLowerCase()) && !h.email.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (activeFilter && h.passType !== activeFilter) return false;
        return true;
      });
    }, [holders, searchTerm, activeFilter]);

    const activePassTypes = passTypes.filter(p => p.status === 'active');
    const totalHolders = passTypes.reduce((s, p) => s + p.holdersCount, 0);
    const totalRevenue = passTypes.reduce((s, p) => s + (p.price * p.holdersCount), 0);
    const avgUsage = holders.length > 0 ? Math.round(holders.reduce((s, h) => s + (h.maxUses < 100 ? (h.usageCount / h.maxUses) * 100 : 0), 0) / holders.filter(h => h.maxUses < 100).length) : 0;

    const formatCurrency = (n: number) => {
      if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
      if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
      return `$${n}`;
    };

    const formatDate = (d: Date) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    };

    const daysRemaining = (d: Date) => {
      const diff = d.getTime() - Date.now();
      return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    const passTypeNames = [...new Set(passTypes.filter(p => p.status === 'active').map(p => p.name))];

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[6] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>
              Season Passes
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {activePassTypes.length} active pass types - {totalHolders.toLocaleString()} total holders
            </Text>
          </div>
          <div
            onClick={onCreatePass}
            style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', ...hoverStyle }}
          >
            + Create Pass Type
          </div>
        </div>

        {/* KPI Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[4], marginBottom: tokens.spacing[6] }}>
          {[
            { label: 'Active Pass Types', value: activePassTypes.length.toString(), icon: '\uD83C\uDFAB', color: tokens.colors.primaryScale },
            { label: 'Total Holders', value: totalHolders.toLocaleString(), icon: '\uD83D\uDC65', color: tokens.colors.successScale },
            { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: '\uD83D\uDCB0', color: tokens.colors.warningScale },
            { label: 'Avg Usage', value: `${avgUsage}%`, icon: '\uD83D\uDCCA', color: tokens.colors.infoScale },
          ].map((stat, i) => (
            <div key={i} style={{ ...cardBase, display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
              <div style={{ width: 44, height: 44, borderRadius: tokens.borderRadius.lg, backgroundColor: stat.color[50], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xl }}>
                {stat.icon}
              </div>
              <div>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block' }}>{stat.label}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{stat.value}</Text>
              </div>
            </div>
          ))}
        </div>

        {/* Pass Type Cards */}
        <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[3] }}>
          Pass Types
        </Text>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[4], marginBottom: tokens.spacing[6] }}>
          {passTypes.map((pt, idx) => {
            const isHovered = hoveredCard === pt.id;
            const isExpired = pt.status === 'expired';
            const days = daysRemaining(pt.validUntil);
            return (
              <div
                key={pt.id}
                onClick={() => onPassTypeClick?.(pt.id)}
                onMouseEnter={() => setHoveredCard(pt.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{ ...cardBase, padding: 0, overflow: 'hidden' as const, cursor: 'pointer', opacity: isExpired ? 0.6 : 1, ...hoverStyle, ...(isHovered ? getHoverTransform(tokens) : {}) }}
              >
                <div style={{ height: 64, background: PASS_GRADIENTS[idx % PASS_GRADIENTS.length], position: 'relative' as const, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `0 ${tokens.spacing[4]}px` }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.common.white, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{pt.name}</Text>
                  <span style={createBadgeStyle(tokens, isExpired ? 'error' : 'success')}>{isExpired ? 'Expired' : 'Active'}</span>
                </div>
                <div style={{ padding: tokens.spacing[4] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[2] }}>{pt.description}</Text>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: tokens.spacing[3] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>${pt.price}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{pt.includedEvents} events</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Holders</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>{pt.holdersCount.toLocaleString()}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                    <span>{formatDate(pt.validFrom)} - {formatDate(pt.validUntil)}</span>
                    {!isExpired && <span style={{ color: days < 30 ? tokens.colors.warningScale[600] : tokens.colors.neutral[400] }}>{days}d left</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Holders Section */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[5] }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[3] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>Pass Holders</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{filteredHolders.length} of {holders.length}</Text>
          </div>

          {/* Search + Filter */}
          <div style={{ display: 'flex', gap: tokens.spacing[3], alignItems: 'center', flexWrap: 'wrap' as const, marginBottom: tokens.spacing[4] }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' as const }}>
              <input
                type="text"
                placeholder="Search holders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap' as const }}>
              <div onClick={() => setActiveFilter(null)} style={createFilterPillStyle(tokens, { active: activeFilter === null })}>All</div>
              {passTypeNames.map(name => (
                <div key={name} onClick={() => setActiveFilter(activeFilter === name ? null : name)} style={createFilterPillStyle(tokens, { active: activeFilter === name })}>
                  {name}
                </div>
              ))}
            </div>
          </div>

          {/* Holders Table */}
          <div style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Holder', 'Email', 'Pass Type', 'Usage', 'Valid Until', 'Status'].map(h => (
                    <th key={h} style={{ textAlign: 'left' as const, padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], backgroundColor: tokens.colors.neutral[50], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredHolders.map((h) => {
                  const usagePct = h.maxUses < 100 ? Math.round((h.usageCount / h.maxUses) * 100) : -1;
                  const progressColor = usagePct >= 90 ? tokens.colors.errorScale[500] : usagePct >= 60 ? tokens.colors.warningScale[500] : tokens.colors.successScale[500];
                  const isExpired = h.validUntil.getTime() < Date.now();
                  const tdStyle = { padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` };
                  return (
                    <tr key={h.id} onClick={() => onHolderClick?.(h.id)} style={{ cursor: onHolderClick ? 'pointer' : 'default' }}>
                      <td style={{ ...tdStyle, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                          <div style={{ width: 28, height: 28, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.primaryScale[700], fontWeight: tokens.typography.fontWeight.semibold }}>{h.holderName.split(' ').map(n => n[0]).join('')}</div>
                          {h.holderName}
                        </div>
                      </td>
                      <td style={{ ...tdStyle, color: tokens.colors.neutral[500] }}>{h.email}</td>
                      <td style={tdStyle}><span style={createBadgeStyle(tokens, 'primary')}>{h.passType}</span></td>
                      <td style={tdStyle}>
                        {usagePct >= 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], minWidth: 120 }}>
                            <div style={{ flex: 1 }}>
                              <div style={createProgressBarStyle(tokens, { percent: usagePct, color: progressColor }).track}>
                                <div style={createProgressBarStyle(tokens, { percent: usagePct, color: progressColor }).fill} />
                              </div>
                            </div>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], whiteSpace: 'nowrap' as const }}>{h.usageCount}/{h.maxUses}</Text>
                          </div>
                        ) : (
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{h.usageCount} uses</Text>
                        )}
                      </td>
                      <td style={tdStyle}>{formatDate(h.validUntil)}</td>
                      <td style={tdStyle}><span style={createBadgeStyle(tokens, isExpired ? 'error' : 'success')}>{isExpired ? 'Expired' : 'Active'}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          {filteredHolders.length === 0 && (
            <div style={{ textAlign: 'center' as const, padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>
              <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>{'\uD83C\uDFAB'}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], display: 'block' }}>No holders match your filters</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>Try adjusting your search or filter criteria</Text>
            </div>
          )}
        </div>

        {/* Summary Bar */}
        <div style={{ ...cardBase, display: 'flex', justifyContent: 'space-around', padding: tokens.spacing[3] }}>
          {[
            { label: 'Total Revenue', value: formatCurrency(totalRevenue), emoji: '\uD83D\uDCB0' },
            { label: 'Active Passes', value: activePassTypes.length.toString(), emoji: '\u2705' },
            { label: 'Expired', value: passTypes.filter(p => p.status === 'expired').length.toString(), emoji: '\u23F0' },
            { label: 'Total Holders', value: totalHolders.toLocaleString(), emoji: '\uD83D\uDC65' },
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
