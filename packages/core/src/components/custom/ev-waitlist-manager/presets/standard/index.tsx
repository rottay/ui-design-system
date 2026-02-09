'use client';

/**
 * EvWaitlistManager - Standard Preset
 * Full waitlist management with queue table, presale codes, notification log, conversion stats
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
import type { EvWaitlistManagerProps, WaitlistEntry, PresaleCode } from '../../core';

const MOCK_ENTRIES: WaitlistEntry[] = [
  { id: 'w1', name: 'Sarah Connor', email: 'sarah@skynet.com', requestedType: 'VIP', position: 1, joinedAt: new Date('2026-01-15'), status: 'waiting', priority: 'vip' },
  { id: 'w2', name: 'John Reese', email: 'john@resistance.io', requestedType: 'GA', position: 2, joinedAt: new Date('2026-01-16'), status: 'notified', priority: 'high' },
  { id: 'w3', name: 'Elena Diaz', email: 'elena.d@email.com', requestedType: 'VIP', position: 3, joinedAt: new Date('2026-01-18'), status: 'converted', priority: 'vip' },
  { id: 'w4', name: 'Marcus Lee', email: 'marcus@inbox.com', requestedType: 'Backstage', position: 4, joinedAt: new Date('2026-01-20'), status: 'waiting', priority: 'normal' },
  { id: 'w5', name: 'Ava Chen', email: 'ava.chen@mail.com', requestedType: 'VIP', position: 5, joinedAt: new Date('2026-01-22'), status: 'notified', priority: 'high' },
  { id: 'w6', name: 'Derek Miles', email: 'derek.m@email.com', requestedType: 'GA', position: 6, joinedAt: new Date('2026-01-25'), status: 'waiting', priority: 'normal' },
  { id: 'w7', name: 'Nina Patel', email: 'nina.p@corp.com', requestedType: 'VIP', position: 7, joinedAt: new Date('2026-02-01'), status: 'expired', priority: 'normal' },
  { id: 'w8', name: 'Kyle Smith', email: 'kyle@email.com', requestedType: 'GA', position: 8, joinedAt: new Date('2026-02-03'), status: 'waiting', priority: 'high' },
];

const MOCK_CODES: PresaleCode[] = [
  { code: 'VIP2026', discount: 20, usageCount: 45, maxUses: 100, validUntil: new Date('2026-06-30'), isActive: true },
  { code: 'EARLY50', discount: 50, usageCount: 12, maxUses: 25, validUntil: new Date('2026-03-31'), isActive: true },
  { code: 'FRIEND15', discount: 15, usageCount: 78, maxUses: 200, validUntil: new Date('2026-12-31'), isActive: true },
  { code: 'SUMMER25', discount: 25, usageCount: 50, maxUses: 50, validUntil: new Date('2026-04-15'), isActive: false },
  { code: 'LAUNCH10', discount: 10, usageCount: 100, maxUses: 100, validUntil: new Date('2026-02-28'), isActive: false },
  { code: 'PREMIUM30', discount: 30, usageCount: 8, maxUses: 50, validUntil: new Date('2026-08-01'), isActive: true },
];

export const StandardEvWaitlistManager = createPreset<EvWaitlistManagerProps>({
  name: 'EvWaitlistManager.Standard',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvWaitlistManagerProps>) => {
    const { Box, Text } = primitives;

    const entries = props.entries ?? MOCK_ENTRIES;
    const presaleCodes = props.presaleCodes ?? MOCK_CODES;
    const { onNotify, onGenerateCode, onToggleCode, className, style } = props;

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const filteredEntries = useMemo(() => {
      return entries.filter(e => {
        if (searchTerm && !e.name.toLowerCase().includes(searchTerm.toLowerCase()) && !e.email.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (statusFilter && e.status !== statusFilter) return false;
        return true;
      });
    }, [entries, searchTerm, statusFilter]);

    const waiting = entries.filter(e => e.status === 'waiting').length;
    const notified = entries.filter(e => e.status === 'notified').length;
    const converted = entries.filter(e => e.status === 'converted').length;
    const expired = entries.filter(e => e.status === 'expired').length;
    const conversionRate = entries.length > 0 ? Math.round((converted / entries.length) * 100) : 0;

    const statusBadge = (s: string): 'warning' | 'info' | 'success' | 'error' => s === 'waiting' ? 'warning' : s === 'notified' ? 'info' : s === 'converted' ? 'success' : 'error';
    const statusIcon = (s: string) => s === 'waiting' ? '\u23F3' : s === 'notified' ? '\uD83D\uDD14' : s === 'converted' ? '\u2705' : '\u23F0';
    const priorityBadge = (p: string): 'error' | 'warning' | 'primary' => p === 'vip' ? 'error' : p === 'high' ? 'warning' : 'primary';
    const priorityIcon = (p: string) => p === 'vip' ? '\u2B50' : p === 'high' ? '\u26A1' : '\u25CB';

    const formatDate = (d: Date) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[d.getMonth()]} ${d.getDate()}`;
    };

    const thStyle = { textAlign: 'left' as const, padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], backgroundColor: tokens.colors.neutral[50], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` };
    const tdStyle = { padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` };

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>
              Waitlist Manager
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {entries.length} total entries - {conversionRate}% conversion rate
            </Text>
          </div>
          <div onClick={onGenerateCode} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', ...hoverStyle }}>
            + Generate Code
          </div>
        </div>

        {/* KPI Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[5] }}>
          {[
            { label: 'Waiting', value: waiting, icon: '\u23F3', color: tokens.colors.warningScale },
            { label: 'Notified', value: notified, icon: '\uD83D\uDD14', color: tokens.colors.infoScale },
            { label: 'Converted', value: converted, icon: '\u2705', color: tokens.colors.successScale },
            { label: 'Expired', value: expired, icon: '\u23F0', color: tokens.colors.errorScale },
            { label: 'Conv. Rate', value: `${conversionRate}%`, icon: '\uD83D\uDCCA', color: tokens.colors.primaryScale },
          ].map((stat, i) => (
            <div key={i} style={{ ...cardBase, display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <div style={{ width: 36, height: 36, borderRadius: tokens.borderRadius.md, backgroundColor: stat.color[50], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.md }}>
                {stat.icon}
              </div>
              <div>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block' }}>{stat.label}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{stat.value}</Text>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: tokens.spacing[5] }}>
          {/* Queue Table */}
          <div style={{ ...cardBase }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[3] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>Waitlist Queue</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{filteredEntries.length} entries</Text>
            </div>

            {/* Search + Status filters */}
            <div style={{ display: 'flex', gap: tokens.spacing[3], alignItems: 'center', flexWrap: 'wrap' as const, marginBottom: tokens.spacing[3] }}>
              <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 1, minWidth: 180, padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }} />
              <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
                <div onClick={() => setStatusFilter(null)} style={createFilterPillStyle(tokens, { active: statusFilter === null })}>All</div>
                {['waiting', 'notified', 'converted', 'expired'].map(s => (
                  <div key={s} onClick={() => setStatusFilter(statusFilter === s ? null : s)} style={createFilterPillStyle(tokens, { active: statusFilter === s })}>
                    {statusIcon(s)} {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Table */}
            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>
                  {['#', 'Name', 'Ticket Type', 'Priority', 'Joined', 'Status', 'Action'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {filteredEntries.map((e) => (
                    <tr key={e.id} onMouseEnter={() => setHoveredRow(e.id)} onMouseLeave={() => setHoveredRow(null)} style={{ backgroundColor: hoveredRow === e.id ? tokens.colors.neutral[50] : 'transparent' }}>
                      <td style={{ ...tdStyle, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[400], width: 40 }}>{e.position}</td>
                      <td style={{ ...tdStyle, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>
                        <div>
                          <div>{e.name}</div>
                          <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{e.email}</div>
                        </div>
                      </td>
                      <td style={tdStyle}><span style={createBadgeStyle(tokens, 'primary')}>{e.requestedType}</span></td>
                      <td style={tdStyle}><span style={createBadgeStyle(tokens, priorityBadge(e.priority))}>{priorityIcon(e.priority)} {e.priority.toUpperCase()}</span></td>
                      <td style={tdStyle}>{formatDate(e.joinedAt)}</td>
                      <td style={tdStyle}><span style={createBadgeStyle(tokens, statusBadge(e.status))}>{statusIcon(e.status)} {e.status}</span></td>
                      <td style={tdStyle}>
                        {e.status === 'waiting' && (
                          <button onClick={() => onNotify?.(e.id)} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, backgroundColor: tokens.colors.primaryScale[50], color: tokens.colors.primaryScale[700], border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`, borderRadius: tokens.borderRadius.sm, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit', fontWeight: tokens.typography.fontWeight.medium }}>Notify</button>
                        )}
                        {e.status === 'notified' && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.infoScale[600] }}>Awaiting response</Text>}
                        {e.status === 'converted' && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.successScale[600] }}>Purchased</Text>}
                        {e.status === 'expired' && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>-</Text>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredEntries.length === 0 && (
              <div style={{ textAlign: 'center' as const, padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>
                <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>{'\uD83D\uDCCB'}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], display: 'block' }}>No entries match your filters</Text>
              </div>
            )}
          </div>

          {/* Right column: Presale Codes */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
            <div style={{ ...cardBase }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[3] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>Presale Codes</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{presaleCodes.filter(c => c.isActive).length} active</Text>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                {presaleCodes.map((code) => {
                  const usagePct = Math.round((code.usageCount / code.maxUses) * 100);
                  const pb = createProgressBarStyle(tokens, { percent: usagePct, color: usagePct >= 90 ? tokens.colors.errorScale[500] : usagePct >= 60 ? tokens.colors.warningScale[500] : tokens.colors.primaryScale[500] });
                  return (
                    <div key={code.code} style={{ padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: code.isActive ? tokens.colors.common.white : tokens.colors.neutral[50], opacity: code.isActive ? 1 : 0.6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[2] }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], fontFamily: 'monospace' }}>{code.code}</Text>
                        <div onClick={() => onToggleCode?.(code.code)} style={{ cursor: 'pointer' }}>
                          <span style={createBadgeStyle(tokens, code.isActive ? 'success' : 'error')}>{code.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[1] }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{code.discount}% off</Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{code.usageCount}/{code.maxUses} used</Text>
                      </div>
                      <div style={pb.track}><div style={pb.fill} /></div>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], marginTop: 2, display: 'block' }}>Expires: {formatDate(code.validUntil)}</Text>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Conversion Funnel */}
            <div style={{ ...cardBase }}>
              <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[3] }}>Conversion Funnel</Text>
              {[
                { label: 'Total Entries', value: entries.length, pct: 100, color: tokens.colors.primaryScale[500] },
                { label: 'Notified', value: notified + converted, pct: entries.length > 0 ? Math.round(((notified + converted) / entries.length) * 100) : 0, color: tokens.colors.infoScale[500] },
                { label: 'Converted', value: converted, pct: conversionRate, color: tokens.colors.successScale[500] },
              ].map((step, i) => {
                const pb = createProgressBarStyle(tokens, { percent: step.pct, color: step.color });
                return (
                  <div key={i} style={{ marginBottom: tokens.spacing[3] }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{step.label}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{step.value} ({step.pct}%)</Text>
                    </div>
                    <div style={{ ...pb.track, height: 8 }}><div style={pb.fill} /></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Box>
    );
  },
});
