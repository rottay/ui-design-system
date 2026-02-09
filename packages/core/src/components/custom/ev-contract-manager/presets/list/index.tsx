'use client';

/**
 * EvContractManager - List Preset
 * Contracts table with search, status filter pills, artist avatars, fee display,
 * deliverable counts, date ranges, KPI summary, and empty state
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
import type { EvContractManagerProps, ArtistContract } from '../../core';

const MOCK_CONTRACTS: ArtistContract[] = [
  { id: 'c1', artistName: 'DJ Nexus', eventName: 'Neon Nights', fee: 8000, currency: 'USD', status: 'signed', startDate: new Date('2026-02-08'), endDate: new Date('2026-02-09'), deliverables: ['2-hour DJ set', 'Meet & greet', 'Social media post'] },
  { id: 'c2', artistName: 'Luna Wave', eventName: 'Sunset Festival', fee: 5000, currency: 'USD', status: 'negotiating', startDate: new Date('2026-02-22'), endDate: new Date('2026-02-23'), deliverables: ['1.5-hour live set', 'Backstage interview'] },
  { id: 'c3', artistName: 'The Voltage', eventName: 'Bass Drop', fee: 12000, currency: 'USD', status: 'draft', startDate: new Date('2026-03-08'), endDate: new Date('2026-03-09'), deliverables: ['3-hour headline set', 'After party DJ set', 'VIP meet & greet', 'Media appearance'] },
  { id: 'c4', artistName: 'Skyline Trio', eventName: 'Rooftop Vibes', fee: 3500, currency: 'USD', status: 'completed', startDate: new Date('2026-01-11'), endDate: new Date('2026-01-12'), deliverables: ['2-hour jazz set', 'Sound check'] },
  { id: 'c5', artistName: 'Echo System', eventName: 'Neon Nights', fee: 6500, currency: 'USD', status: 'sent', startDate: new Date('2026-02-08'), endDate: new Date('2026-02-09'), deliverables: ['1-hour support set', 'Photo op'] },
  { id: 'c6', artistName: 'Neon Pulse', eventName: 'Bass Drop', fee: 4500, currency: 'USD', status: 'negotiating', startDate: new Date('2026-03-08'), endDate: new Date('2026-03-09'), deliverables: ['1-hour warm-up set', 'Social post'] },
  { id: 'c7', artistName: 'Aria Beats', eventName: 'Sunset Festival', fee: 7200, currency: 'USD', status: 'signed', startDate: new Date('2026-02-22'), endDate: new Date('2026-02-23'), deliverables: ['2-hour headline set', 'Press interview', 'VIP session'] },
  { id: 'c8', artistName: 'Bass Theory', eventName: 'Rooftop Vibes', fee: 3000, currency: 'USD', status: 'draft', startDate: new Date('2026-03-15'), endDate: new Date('2026-03-16'), deliverables: ['1.5-hour set'] },
];

const STATUS_CONFIG: Record<string, { badge: 'warning' | 'success' | 'error' | 'info' | 'primary' | 'secondary'; label: string; step: number }> = {
  draft: { badge: 'secondary', label: 'Draft', step: 1 },
  sent: { badge: 'info', label: 'Sent', step: 2 },
  negotiating: { badge: 'warning', label: 'Negotiating', step: 3 },
  signed: { badge: 'success', label: 'Signed', step: 4 },
  completed: { badge: 'primary', label: 'Completed', step: 5 },
};

const STEPS = ['draft', 'sent', 'negotiating', 'signed', 'completed'];

export const ListEvContractManager = createPreset<EvContractManagerProps>({
  name: 'EvContractManager.List',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvContractManagerProps>) => {
    const { Box, Text } = primitives;
    const { contracts, onContractClick, onCreateContract, onSignContract, className, style } = props;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const data = contracts?.length ? contracts : MOCK_CONTRACTS;
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    const filtered = useMemo(() => {
      return data.filter(c => {
        if (searchTerm && !c.artistName.toLowerCase().includes(searchTerm.toLowerCase()) && !c.eventName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (activeFilter && c.status !== activeFilter) return false;
        return true;
      });
    }, [data, searchTerm, activeFilter]);

    const totalFees = data.reduce((s, c) => s + c.fee, 0);
    const signedFees = data.filter(c => c.status === 'signed' || c.status === 'completed').reduce((s, c) => s + c.fee, 0);
    const pendingCount = data.filter(c => c.status === 'draft' || c.status === 'sent' || c.status === 'negotiating').length;
    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const avgFee = Math.round(totalFees / data.length);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>
              Artist Contracts
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{filtered.length} of {data.length} contracts | ${totalFees.toLocaleString()} total fees</Text>
          </div>
          <button onClick={onCreateContract} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, border: 'none', backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer' }}>
            + New Contract
          </button>
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          {[
            { label: 'Total Contracts', value: data.length.toString(), color: tokens.colors.primaryScale[600] },
            { label: 'Total Fees', value: `$${totalFees.toLocaleString()}`, color: tokens.colors.infoScale[600] },
            { label: 'Signed/Completed', value: `$${signedFees.toLocaleString()}`, color: tokens.colors.successScale[600] },
            { label: 'Avg Fee', value: `$${avgFee.toLocaleString()}`, color: tokens.colors.warningScale[600] },
          ].map(kpi => (
            <div key={kpi.label} style={{ ...cardBase, padding: tokens.spacing[4], borderTop: `3px solid ${kpi.color}`, textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: kpi.color, display: 'block' }}>{kpi.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{kpi.label}</Text>
            </div>
          ))}
        </div>

        {/* Status Pipeline */}
        <div style={{ ...cardBase, padding: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {STEPS.map((step, i) => {
              const cfg = STATUS_CONFIG[step];
              const count = data.filter(c => c.status === step).length;
              return (
                <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
                  <div onClick={() => setActiveFilter(activeFilter === step ? null : step)} style={{ textAlign: 'center' as const, cursor: 'pointer', opacity: activeFilter && activeFilter !== step ? 0.4 : 1 }}>
                    <div style={{ width: 36, height: 36, borderRadius: tokens.borderRadius.full, backgroundColor: count > 0 ? tokens.colors[`${cfg.badge === 'secondary' ? 'primary' : cfg.badge}Scale`][100] : tokens.colors.neutral[100], display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', marginBottom: tokens.spacing[1] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: count > 0 ? tokens.colors[`${cfg.badge === 'secondary' ? 'primary' : cfg.badge}Scale`][700] : tokens.colors.neutral[400] }}>{count}</Text>
                    </div>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], textTransform: 'capitalize' as const }}>{step}</Text>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 2, backgroundColor: tokens.colors.neutral[200], margin: `0 ${tokens.spacing[2]}px`, marginBottom: tokens.spacing[4] }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Search & Filters */}
        <div style={{ ...cardBase, padding: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <input type="text" placeholder="Search by artist or event..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ flex: 1, padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }} />
            <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
              <div onClick={() => setActiveFilter(null)} style={createFilterPillStyle(tokens, { active: activeFilter === null })}>All</div>
              {STEPS.map(s => (
                <div key={s} onClick={() => setActiveFilter(activeFilter === s ? null : s)} style={createFilterPillStyle(tokens, { active: activeFilter === s })}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contract Table */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <thead>
              <tr style={{ backgroundColor: tokens.colors.neutral[50] }}>
                {['Artist', 'Event', 'Fee', 'Dates', 'Deliverables', 'Progress', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: `${tokens.spacing[3]}px`, textAlign: 'left' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(contract => {
                const sm = STATUS_CONFIG[contract.status];
                const isHovered = hoveredRow === contract.id;
                const stepIdx = STEPS.indexOf(contract.status);
                const pct = Math.round(((stepIdx + 1) / STEPS.length) * 100);
                const progressBar = createProgressBarStyle(tokens, { percent: pct, color: contract.status === 'completed' ? tokens.colors.successScale[500] : contract.status === 'signed' ? tokens.colors.successScale[400] : tokens.colors.primaryScale[400] });
                return (
                  <tr key={contract.id} onClick={() => onContractClick?.(contract.id)} onMouseEnter={() => setHoveredRow(contract.id)} onMouseLeave={() => setHoveredRow(null)} style={{ cursor: 'pointer', backgroundColor: isHovered ? tokens.colors.primaryScale[50] : 'transparent', transition: 'background-color 0.15s ease' }}>
                    <td style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <div style={{ width: 32, height: 32, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[700] }}>
                          {contract.artistName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{contract.artistName}</Text>
                      </div>
                    </td>
                    <td style={{ padding: `${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>{contract.eventName}</td>
                    <td style={{ padding: `${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>${contract.fee.toLocaleString()}</td>
                    <td style={{ padding: `${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>{formatDate(contract.startDate)} - {formatDate(contract.endDate)}</td>
                    <td style={{ padding: `${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 2 }}>
                        {contract.deliverables.slice(0, 2).map((d, i) => (
                          <span key={i} style={createBadgeStyle(tokens, 'info')}>{d}</span>
                        ))}
                        {contract.deliverables.length > 2 && <span style={createBadgeStyle(tokens, 'primary')}>+{contract.deliverables.length - 2}</span>}
                      </div>
                    </td>
                    <td style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, width: 80 }}>
                      <div style={progressBar.track}><div style={progressBar.fill} /></div>
                      <Text style={{ fontSize: 10, color: tokens.colors.neutral[400], marginTop: 2 }}>{pct}%</Text>
                    </td>
                    <td style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}><span style={createBadgeStyle(tokens, sm.badge as 'warning' | 'success' | 'info')}>{sm.label}</span></td>
                    <td style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                      {(contract.status === 'negotiating' || contract.status === 'sent') && (
                        <button onClick={e => { e.stopPropagation(); onSignContract?.(contract.id); }} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.sm, border: 'none', backgroundColor: tokens.colors.successScale[500], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer' }}>Sign</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center' as const, padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>{'\uD83D\uDCDD'}</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], display: 'block' }}>No contracts match your filters</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>Try adjusting your search or filter criteria</Text>
          </div>
        )}

        {/* Summary Bar */}
        <div style={{ ...cardBase, display: 'flex', justifyContent: 'space-around', padding: tokens.spacing[3], marginTop: tokens.spacing[4] }}>
          {[
            { label: 'Pending', value: pendingCount.toString() },
            { label: 'Signed', value: data.filter(c => c.status === 'signed').length.toString() },
            { label: 'Completed', value: data.filter(c => c.status === 'completed').length.toString() },
            { label: 'Total Deliverables', value: data.reduce((s, c) => s + c.deliverables.length, 0).toString() },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{stat.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{stat.label}</Text>
            </div>
          ))}
        </div>
      </Box>
    );
  },
});
