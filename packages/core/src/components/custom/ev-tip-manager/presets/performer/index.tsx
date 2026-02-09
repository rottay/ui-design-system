'use client';

/**
 * EvTipManager - Performer Preset
 * Tip stats KPI cards, tip feed with search/filter, payout section, progress bars
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
import type { EvTipManagerProps, TipRecord, TipStats, PayoutInfo } from '../../core';

const MOCK_STATS: TipStats = { totalAmount: 2450, currency: 'USD', tipCount: 67, averageTip: 36.57, topTipper: 'PartyKing', topAmount: 150 };

const MOCK_TIPS: TipRecord[] = [
  { id: 't1', from: 'PartyKing', amount: 150, currency: 'USD', type: 'fiat', message: 'Best set ever!', sessionId: 's1', time: new Date(Date.now() - 30000) },
  { id: 't2', from: 'VIPVibes', amount: 100, currency: 'USD', type: 'fiat', message: 'Love the vibes!', sessionId: 's1', time: new Date(Date.now() - 120000) },
  { id: 't3', from: 'CryptoWhale', amount: 75, currency: 'ETH', type: 'crypto', message: 'To the moon!', sessionId: 's1', time: new Date(Date.now() - 300000) },
  { id: 't4', from: 'NeonQueen', amount: 50, currency: 'USD', type: 'fiat', sessionId: 's1', time: new Date(Date.now() - 600000) },
  { id: 't5', from: 'BassDropper', amount: 25, currency: 'BTC', type: 'crypto', message: 'Fire drops!', sessionId: 's1', time: new Date(Date.now() - 900000) },
  { id: 't6', from: 'DanceMachine', amount: 20, currency: 'USD', type: 'fiat', sessionId: 's1', time: new Date(Date.now() - 1200000) },
  { id: 't7', from: 'GlowStick', amount: 15, currency: 'USD', type: 'fiat', message: 'Amazing!', sessionId: 's1', time: new Date(Date.now() - 1500000) },
  { id: 't8', from: 'RaveLover', amount: 10, currency: 'USD', type: 'fiat', sessionId: 's1', time: new Date(Date.now() - 1800000) },
];

const MOCK_PAYOUTS: PayoutInfo[] = [
  { id: 'p1', amount: 1800, method: 'Bank Transfer', status: 'completed', requestedAt: new Date(Date.now() - 86400000 * 3) },
  { id: 'p2', amount: 650, method: 'PayPal', status: 'processing', requestedAt: new Date(Date.now() - 86400000) },
];

export const PerformerEvTipManager = createPreset<EvTipManagerProps>({
  name: 'EvTipManager.Performer',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvTipManagerProps>) => {
    const { Box, Text } = primitives;
    const { tips = MOCK_TIPS, stats = MOCK_STATS, payouts = MOCK_PAYOUTS, onRequestPayout, className, style } = props;

    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'fiat' | 'crypto'>('all');
    const [hoveredTip, setHoveredTip] = useState<string | null>(null);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const filteredTips = useMemo(() => {
      return tips.filter(tip => {
        if (searchTerm && !tip.from.toLowerCase().includes(searchTerm.toLowerCase()) && !(tip.message || '').toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (filterType !== 'all' && tip.type !== filterType) return false;
        return true;
      });
    }, [tips, searchTerm, filterType]);

    const formatTime = (d: Date) => {
      const diff = Math.floor((Date.now() - d.getTime()) / 1000);
      if (diff < 60) return `${diff}s ago`;
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    };

    const goalAmount = 3000;
    const goalPct = Math.min(100, Math.round((stats.totalAmount / goalAmount) * 100));
    const goalBar = createProgressBarStyle(tokens, { percent: goalPct, color: goalPct >= 100 ? tokens.colors.successScale[500] : goalPct >= 50 ? tokens.colors.primaryScale[500] : tokens.colors.warningScale[500] });

    const fiatTotal = tips.filter(t => t.type === 'fiat').reduce((s, t) => s + t.amount, 0);
    const cryptoTotal = tips.filter(t => t.type === 'crypto').reduce((s, t) => s + t.amount, 0);
    const fiatPct = stats.totalAmount > 0 ? Math.round((fiatTotal / stats.totalAmount) * 100) : 0;

    const statCards = [
      { label: 'Total Tips', value: `$${stats.totalAmount.toLocaleString()}`, emoji: '\uD83D\uDCB0', color: 'success' as const },
      { label: 'Tip Count', value: stats.tipCount.toString(), emoji: '\uD83C\uDFAF', color: 'primary' as const },
      { label: 'Average Tip', value: `$${stats.averageTip.toFixed(2)}`, emoji: '\uD83D\uDCCA', color: 'info' as const },
      { label: 'Top Tipper', value: `${stats.topTipper} ($${stats.topAmount})`, emoji: '\uD83D\uDC51', color: 'warning' as const },
    ];

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        <div style={{ marginBottom: tokens.spacing[5] }}>
          <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{'\uD83D\uDCB0'} Tip Manager</Text>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Your earnings and tip history</Text>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[4], marginBottom: tokens.spacing[5] }}>
          {statCards.map((s, i) => (
            <div key={i} style={{ ...cardBase, textAlign: 'center' as const }}>
              <div style={{ fontSize: 24, marginBottom: tokens.spacing[2] }}>{s.emoji}</div>
              <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors[`${s.color}Scale`][600], display: 'block' }}>{s.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{s.label}</Text>
            </div>
          ))}
        </div>

        {/* Goal Progress */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[5], padding: tokens.spacing[4] }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[2] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{'\uD83C\uDFAF'} Session Goal</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[700] }}>${stats.totalAmount.toLocaleString()} / ${goalAmount.toLocaleString()}</Text>
          </div>
          <div style={goalBar.track}><div style={goalBar.fill} /></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: tokens.spacing[1] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{goalPct}% reached</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Fiat: {fiatPct}% | Crypto: {100 - fiatPct}%</Text>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: tokens.spacing[6] }}>
          {/* Recent Tips */}
          <div>
            {/* Search & Filter */}
            <div style={{ ...cardBase, padding: tokens.spacing[3], marginBottom: tokens.spacing[3] }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], flexWrap: 'wrap' as const }}>
                <div style={{ flex: 1, minWidth: 160, position: 'relative' as const }}>
                  <div style={{ position: 'absolute' as const, left: tokens.spacing[3], top: '50%', transform: 'translateY(-50%)', color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>{'\uD83D\uDD0D'}</div>
                  <input type="text" placeholder="Search tippers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
                  <div onClick={() => setFilterType('all')} style={createFilterPillStyle(tokens, { active: filterType === 'all' })}>All ({tips.length})</div>
                  <div onClick={() => setFilterType('fiat')} style={createFilterPillStyle(tokens, { active: filterType === 'fiat' })}>{'\uD83D\uDCB5'} Fiat</div>
                  <div onClick={() => setFilterType('crypto')} style={createFilterPillStyle(tokens, { active: filterType === 'crypto' })}>{'\uD83E\uDE99'} Crypto</div>
                </div>
              </div>
            </div>

            <div style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `1px solid ${tokens.colors.neutral[200]}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{'\uD83D\uDD14'} Recent Tips ({filteredTips.length})</Text>
              </div>
              {filteredTips.length === 0 ? (
                <div style={{ padding: tokens.spacing[6], textAlign: 'center' as const }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>No tips match your search</Text>
                </div>
              ) : filteredTips.map((tip, idx) => {
                const isHovered = hoveredTip === tip.id;
                return (
                  <div key={tip.id}
                    onMouseEnter={() => setHoveredTip(tip.id)} onMouseLeave={() => setHoveredTip(null)}
                    style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: idx < filteredTips.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', ...hoverStyle, ...(isHovered ? getHoverTransform(tokens) : {}) }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                      <div style={{ width: 36, height: 36, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.successScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{'\uD83D\uDCB8'}</div>
                      <div>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800], display: 'block' }}>{tip.from}</Text>
                        {tip.message && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], fontStyle: 'italic' as const }}>&quot;{tip.message}&quot;</Text>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <span style={tip.type === 'crypto' ? createBadgeStyle(tokens, 'info') : createBadgeStyle(tokens, 'success')}>
                        {tip.type === 'crypto' ? '\uD83E\uDE99' : '\uD83D\uDCB5'} {tip.type}
                      </span>
                      <div style={{ textAlign: 'right' as const }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600], display: 'block' }}>${tip.amount}</Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{formatTime(tip.time)}</Text>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payout Section */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
            <button onClick={onRequestPayout} style={{ padding: `${tokens.spacing[3]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.lg, fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, cursor: 'pointer', fontFamily: 'inherit', ...hoverStyle }}>
              {'\uD83D\uDCB3'} Request Payout
            </button>
            <div style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `1px solid ${tokens.colors.neutral[200]}` }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{'\uD83D\uDCCB'} Payout History</Text>
              </div>
              {payouts.map((p, idx) => (
                <div key={p.id} style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: idx < payouts.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[1] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>${p.amount}</Text>
                    <span style={p.status === 'completed' ? createBadgeStyle(tokens, 'success') : p.status === 'processing' ? createBadgeStyle(tokens, 'warning') : createBadgeStyle(tokens, 'info')}>
                      {p.status === 'completed' ? '\u2705' : p.status === 'processing' ? '\u23F3' : '\uD83D\uDCDD'} {p.status}
                    </span>
                  </div>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{p.method} - {formatTime(p.requestedAt)}</Text>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Bar */}
        <div style={{ ...cardBase, marginTop: tokens.spacing[5], display: 'flex', justifyContent: 'space-around', padding: tokens.spacing[3] }}>
          {[
            { label: 'Total Earned', value: `$${stats.totalAmount.toLocaleString()}`, emoji: '\uD83D\uDCB0' },
            { label: 'Tips Received', value: stats.tipCount.toString(), emoji: '\uD83C\uDFAF' },
            { label: 'Avg Tip', value: `$${stats.averageTip.toFixed(2)}`, emoji: '\uD83D\uDCCA' },
            { label: 'Goal Progress', value: `${goalPct}%`, emoji: '\uD83C\uDFAF' },
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
