'use client';

/**
 * EvTipManager - Admin Preset
 * All artists tip table, session breakdown, payout management with search/filter, progress bars
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
import type { EvTipManagerProps, TipRecord, PayoutInfo } from '../../core';

const MOCK_TIPS: TipRecord[] = [
  { id: 't1', from: 'PartyKing', amount: 150, currency: 'USD', type: 'fiat', message: 'Best set!', sessionId: 's1', time: new Date(Date.now() - 30000) },
  { id: 't2', from: 'VIPVibes', amount: 100, currency: 'USD', type: 'fiat', sessionId: 's2', time: new Date(Date.now() - 120000) },
  { id: 't3', from: 'CryptoWhale', amount: 75, currency: 'ETH', type: 'crypto', sessionId: 's1', time: new Date(Date.now() - 300000) },
  { id: 't4', from: 'NeonQueen', amount: 50, currency: 'USD', type: 'fiat', sessionId: 's3', time: new Date(Date.now() - 600000) },
  { id: 't5', from: 'BassDropper', amount: 25, currency: 'BTC', type: 'crypto', sessionId: 's2', time: new Date(Date.now() - 900000) },
  { id: 't6', from: 'DanceMachine', amount: 80, currency: 'USD', type: 'fiat', sessionId: 's1', time: new Date(Date.now() - 1200000) },
  { id: 't7', from: 'GlowStick', amount: 35, currency: 'USD', type: 'fiat', message: 'Great show!', sessionId: 's3', time: new Date(Date.now() - 1500000) },
  { id: 't8', from: 'RaveLover', amount: 60, currency: 'USD', type: 'fiat', sessionId: 's2', time: new Date(Date.now() - 1800000) },
];

const MOCK_PAYOUTS: PayoutInfo[] = [
  { id: 'p1', amount: 1800, method: 'Bank Transfer', status: 'completed', requestedAt: new Date(Date.now() - 86400000 * 3) },
  { id: 'p2', amount: 650, method: 'PayPal', status: 'processing', requestedAt: new Date(Date.now() - 86400000) },
  { id: 'p3', amount: 420, method: 'Crypto Wallet', status: 'pending', requestedAt: new Date(Date.now() - 3600000) },
];

const ARTIST_DATA = [
  { name: 'DJ Nova', sessions: 12, totalTips: 2450, avgTip: 36, pendingPayout: 650, status: 'active' },
  { name: 'MC Thunder', sessions: 8, totalTips: 1820, avgTip: 42, pendingPayout: 420, status: 'active' },
  { name: 'VJ Aurora', sessions: 5, totalTips: 980, avgTip: 28, pendingPayout: 0, status: 'active' },
  { name: 'DJ Eclipse', sessions: 3, totalTips: 560, avgTip: 31, pendingPayout: 560, status: 'inactive' },
];

const SESSION_DATA = [
  { name: 'Neon Nights Main Stage', artist: 'DJ Nova', date: 'Feb 7, 2026', tips: 890, count: 24 },
  { name: 'Underground Bass', artist: 'MC Thunder', date: 'Feb 6, 2026', tips: 720, count: 18 },
  { name: 'Chill Zone', artist: 'VJ Aurora', date: 'Feb 6, 2026', tips: 340, count: 12 },
  { name: 'After Hours', artist: 'DJ Nova', date: 'Feb 5, 2026', tips: 1560, count: 43 },
];

export const AdminEvTipManager = createPreset<EvTipManagerProps>({
  name: 'EvTipManager.Admin',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvTipManagerProps>) => {
    const { Box, Text } = primitives;
    const { tips: rawTips = MOCK_TIPS, payouts: rawPayouts = MOCK_PAYOUTS, className, style } = props;

    const tips = Array.isArray(rawTips) ? rawTips : MOCK_TIPS;
    const payouts = Array.isArray(rawPayouts) ? rawPayouts : MOCK_PAYOUTS;

    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [hoveredArtist, setHoveredArtist] = useState<string | null>(null);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const filteredArtists = useMemo(() => {
      return ARTIST_DATA.filter(a => {
        if (searchTerm && !a.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (activeFilter === 'active' && a.status !== 'active') return false;
        if (activeFilter === 'pending' && a.pendingPayout === 0) return false;
        return true;
      });
    }, [searchTerm, activeFilter]);

    const totalTips = ARTIST_DATA.reduce((s, a) => s + a.totalTips, 0);
    const totalPending = ARTIST_DATA.reduce((s, a) => s + a.pendingPayout, 0);
    const totalSessions = ARTIST_DATA.reduce((s, a) => s + a.sessions, 0);
    const topArtist = ARTIST_DATA.reduce((top, a) => a.totalTips > top.totalTips ? a : top, ARTIST_DATA[0]);

    const formatTime = (d: Date) => {
      const diff = Math.floor((Date.now() - d.getTime()) / 1000);
      if (diff < 60) return `${diff}s ago`;
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    };

    const thStyle = { padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, textAlign: 'left' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], borderBottom: `1px solid ${tokens.colors.neutral[200]}`, textTransform: 'uppercase' as const, letterSpacing: '0.05em' };
    const tdStyle = { padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800], borderBottom: `1px solid ${tokens.colors.neutral[100]}` };

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{'\uD83D\uDCB0'} Tip Administration</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Manage artist tips and payouts</Text>
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[4] }}>
            <div style={{ ...cardBase, textAlign: 'center' as const, padding: tokens.spacing[3] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600], display: 'block' }}>${totalTips.toLocaleString()}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Total Tips</Text>
            </div>
            <div style={{ ...cardBase, textAlign: 'center' as const, padding: tokens.spacing[3] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.warningScale[600], display: 'block' }}>${totalPending.toLocaleString()}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Pending Payouts</Text>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div style={{ ...cardBase, padding: tokens.spacing[3], marginBottom: tokens.spacing[5] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], flexWrap: 'wrap' as const }}>
            <div style={{ flex: 1, minWidth: 180, position: 'relative' as const }}>
              <div style={{ position: 'absolute' as const, left: tokens.spacing[3], top: '50%', transform: 'translateY(-50%)', color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>{'\uD83D\uDD0D'}</div>
              <input type="text" placeholder="Search artists..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
              <div onClick={() => setActiveFilter(null)} style={createFilterPillStyle(tokens, { active: activeFilter === null })}>All ({ARTIST_DATA.length})</div>
              <div onClick={() => setActiveFilter(activeFilter === 'active' ? null : 'active')} style={createFilterPillStyle(tokens, { active: activeFilter === 'active' })}>{'\uD83D\uDFE2'} Active</div>
              <div onClick={() => setActiveFilter(activeFilter === 'pending' ? null : 'pending')} style={createFilterPillStyle(tokens, { active: activeFilter === 'pending' })}>{'\u23F3'} Has Pending</div>
            </div>
          </div>
        </div>

        {/* Artists Table */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden', marginBottom: tokens.spacing[6] }}>
          <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `1px solid ${tokens.colors.neutral[200]}` }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{'\uD83C\uDFA4'} Artists Overview</Text>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <thead><tr>
              <th style={thStyle}>Artist</th><th style={thStyle}>Sessions</th><th style={thStyle}>Total Tips</th><th style={thStyle}>Avg Tip</th><th style={thStyle}>Pending</th><th style={thStyle}>Share</th><th style={thStyle}>Status</th>
            </tr></thead>
            <tbody>
              {filteredArtists.map((a) => {
                const sharePct = totalTips > 0 ? Math.round((a.totalTips / totalTips) * 100) : 0;
                const shareBar = createProgressBarStyle(tokens, { percent: sharePct, color: tokens.colors.primaryScale[500] });
                const isHovered = hoveredArtist === a.name;
                return (
                  <tr key={a.name}
                    onMouseEnter={() => setHoveredArtist(a.name)} onMouseLeave={() => setHoveredArtist(null)}
                    style={{ backgroundColor: isHovered ? tokens.colors.neutral[50] : 'transparent', ...hoverStyle }}>
                    <td style={{ ...tdStyle, fontWeight: tokens.typography.fontWeight.medium }}>{a.name}</td>
                    <td style={tdStyle}>{a.sessions}</td>
                    <td style={{ ...tdStyle, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600] }}>${a.totalTips.toLocaleString()}</td>
                    <td style={tdStyle}>${a.avgTip}</td>
                    <td style={{ ...tdStyle, color: a.pendingPayout > 0 ? tokens.colors.warningScale[600] : tokens.colors.neutral[400] }}>{a.pendingPayout > 0 ? `$${a.pendingPayout}` : '-'}</td>
                    <td style={{ ...tdStyle, minWidth: 80 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                        <div style={{ flex: 1 }}><div style={shareBar.track}><div style={shareBar.fill} /></div></div>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], minWidth: 28 }}>{sharePct}%</Text>
                      </div>
                    </td>
                    <td style={tdStyle}><span style={a.status === 'active' ? createBadgeStyle(tokens, 'success') : createBadgeStyle(tokens, 'secondary')}>{a.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Empty state */}
          {filteredArtists.length === 0 && (
            <div style={{ padding: tokens.spacing[6], textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>No artists match your search</Text>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[6] }}>
          {/* Session Breakdown */}
          <div style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `1px solid ${tokens.colors.neutral[200]}` }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{'\uD83D\uDCC5'} Session Breakdown</Text>
            </div>
            {SESSION_DATA.map((s, i) => {
              const sessionPct = Math.min(100, Math.round((s.tips / 1600) * 100));
              const sessionBar = createProgressBarStyle(tokens, { percent: sessionPct, color: tokens.colors.successScale[500] });
              return (
                <div key={i} style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: i < SESSION_DATA.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none', ...hoverStyle }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>{s.name}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600] }}>${s.tips}</Text>
                  </div>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1] }}>{s.artist} - {s.date} - {s.count} tips</Text>
                  <div style={sessionBar.track}><div style={sessionBar.fill} /></div>
                </div>
              );
            })}
          </div>

          {/* Payout Management */}
          <div style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `1px solid ${tokens.colors.neutral[200]}` }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{'\uD83D\uDCB3'} Payout Management</Text>
            </div>
            {payouts.map((p, i) => (
              <div key={p.id} style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: i < payouts.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', ...hoverStyle }}>
                <div>
                  <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>${p.amount}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{p.method} - {formatTime(p.requestedAt)}</Text>
                </div>
                <div style={{ textAlign: 'right' as const }}>
                  <span style={p.status === 'completed' ? createBadgeStyle(tokens, 'success') : p.status === 'processing' ? createBadgeStyle(tokens, 'warning') : createBadgeStyle(tokens, 'info')}>
                    {p.status === 'completed' ? '\u2705' : p.status === 'processing' ? '\u23F3' : '\uD83D\uDCDD'} {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Bar */}
        <div style={{ ...cardBase, marginTop: tokens.spacing[5], display: 'flex', justifyContent: 'space-around', padding: tokens.spacing[3] }}>
          {[
            { label: 'Total Revenue', value: `$${totalTips.toLocaleString()}`, emoji: '\uD83D\uDCB0' },
            { label: 'Artists', value: ARTIST_DATA.length.toString(), emoji: '\uD83C\uDFA4' },
            { label: 'Sessions', value: totalSessions.toString(), emoji: '\uD83D\uDCC5' },
            { label: 'Top Earner', value: topArtist.name, emoji: '\uD83D\uDC51' },
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
