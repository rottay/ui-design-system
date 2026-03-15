'use client';

/**
 * EvWaitlistManager - Priority Preset
 * Priority-focused lane view with VIP/high/normal tiers, grouped entries, quick-notify actions
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
  { id: 'w2', name: 'Elena Diaz', email: 'elena.d@email.com', requestedType: 'VIP', position: 2, joinedAt: new Date('2026-01-18'), status: 'waiting', priority: 'vip' },
  { id: 'w3', name: 'John Reese', email: 'john@resistance.io', requestedType: 'GA', position: 3, joinedAt: new Date('2026-01-16'), status: 'notified', priority: 'high' },
  { id: 'w4', name: 'Ava Chen', email: 'ava.chen@mail.com', requestedType: 'VIP', position: 4, joinedAt: new Date('2026-01-22'), status: 'waiting', priority: 'high' },
  { id: 'w5', name: 'Kyle Smith', email: 'kyle@email.com', requestedType: 'GA', position: 5, joinedAt: new Date('2026-02-03'), status: 'waiting', priority: 'high' },
  { id: 'w6', name: 'Marcus Lee', email: 'marcus@inbox.com', requestedType: 'Backstage', position: 6, joinedAt: new Date('2026-01-20'), status: 'waiting', priority: 'normal' },
  { id: 'w7', name: 'Derek Miles', email: 'derek.m@email.com', requestedType: 'GA', position: 7, joinedAt: new Date('2026-01-25'), status: 'converted', priority: 'normal' },
  { id: 'w8', name: 'Nina Patel', email: 'nina.p@corp.com', requestedType: 'VIP', position: 8, joinedAt: new Date('2026-02-01'), status: 'expired', priority: 'normal' },
  { id: 'w9', name: 'Leo Torres', email: 'leo.t@email.com', requestedType: 'GA', position: 9, joinedAt: new Date('2026-02-04'), status: 'waiting', priority: 'normal' },
  { id: 'w10', name: 'Mia Park', email: 'mia.park@mail.com', requestedType: 'VIP', position: 10, joinedAt: new Date('2026-01-28'), status: 'notified', priority: 'vip' },
];

const MOCK_CODES: PresaleCode[] = [
  { code: 'VIP2026', discount: 20, usageCount: 45, maxUses: 100, validUntil: new Date('2026-06-30'), isActive: true },
  { code: 'EARLY50', discount: 50, usageCount: 12, maxUses: 25, validUntil: new Date('2026-03-31'), isActive: true },
  { code: 'PREMIUM30', discount: 30, usageCount: 8, maxUses: 50, validUntil: new Date('2026-08-01'), isActive: true },
];

const PRIORITY_CONFIG: Record<string, { label: string; icon: string; color: string; badgeColor: 'error' | 'warning' | 'primary'; gradient: string }> = {
  vip: { label: 'VIP', icon: '\u2B50', color: '#FFD700', badgeColor: 'error', gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' },
  high: { label: 'High Priority', icon: '\u26A1', color: '#FF6B35', badgeColor: 'warning', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  normal: { label: 'Standard', icon: '\u25CB', color: '#6C757D', badgeColor: 'primary', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
};

export const PriorityEvWaitlistManager = createPreset<EvWaitlistManagerProps>({
  name: 'EvWaitlistManager.Priority',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvWaitlistManagerProps>) => {
    const { Box, Text } = primitives;

    const entries = props.entries ?? MOCK_ENTRIES;
    const presaleCodes = props.presaleCodes ?? MOCK_CODES;
    const { onNotify, onGenerateCode, onToggleCode, className, style } = props;

    const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
    const [hoveredEntry, setHoveredEntry] = useState<string | null>(null);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const groupedEntries = useMemo(() => {
      const groups: Record<string, WaitlistEntry[]> = { vip: [], high: [], normal: [] };
      entries.forEach(e => {
        if (!selectedPriority || e.priority === selectedPriority) {
          (groups[e.priority] || groups.normal).push(e);
        }
      });
      return groups;
    }, [entries, selectedPriority]);

    const waiting = entries.filter(e => e.status === 'waiting').length;
    const converted = entries.filter(e => e.status === 'converted').length;
    const conversionRate = entries.length > 0 ? Math.round((converted / entries.length) * 100) : 0;

    const statusIcon = (s: string) => s === 'waiting' ? '\u23F3' : s === 'notified' ? '\uD83D\uDD14' : s === 'converted' ? '\u2705' : '\u23F0';
    const statusBadge = (s: string): 'warning' | 'info' | 'success' | 'error' => s === 'waiting' ? 'warning' : s === 'notified' ? 'info' : s === 'converted' ? 'success' : 'error';

    const formatDate = (d: Date) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[d.getMonth()]} ${d.getDate()}`;
    };

    const timeSince = (d: Date) => {
      const days = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (days === 0) return 'Today';
      if (days === 1) return '1 day ago';
      return `${days}d ago`;
    };

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[4], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[4] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>
              Priority Queue
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {waiting} waiting - {conversionRate}% conversion
            </Text>
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
            <div onClick={onGenerateCode} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', ...hoverStyle }}>
              + Code
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          {(['vip', 'high', 'normal'] as const).map(p => {
            const cfg = PRIORITY_CONFIG[p];
            const count = entries.filter(e => e.priority === p).length;
            const waitingCount = entries.filter(e => e.priority === p && e.status === 'waiting').length;
            return (
              <div key={p} style={{ ...cardBase, padding: 0, overflow: 'hidden' as const, cursor: 'pointer', ...hoverStyle }} onClick={() => setSelectedPriority(selectedPriority === p ? null : p)}>
                <div style={{ height: 4, background: cfg.gradient }} />
                <div style={{ padding: tokens.spacing[3], display: 'flex', alignItems: 'center', gap: tokens.spacing[3], backgroundColor: selectedPriority === p ? tokens.colors.primaryScale[50] : tokens.colors.common.white }}>
                  <span style={{ fontSize: tokens.typography.fontSize.xl }}>{cfg.icon}</span>
                  <div style={{ flex: 1 }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>{cfg.label}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{count} total, {waitingCount} waiting</Text>
                  </div>
                  <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{count}</Text>
                </div>
              </div>
            );
          })}
        </div>

        {/* Priority filter pills */}
        <div style={{ display: 'flex', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
          <div onClick={() => setSelectedPriority(null)} style={createFilterPillStyle(tokens, { active: selectedPriority === null })}>All ({entries.length})</div>
          {(['vip', 'high', 'normal'] as const).map(p => (
            <div key={p} onClick={() => setSelectedPriority(selectedPriority === p ? null : p)} style={createFilterPillStyle(tokens, { active: selectedPriority === p })}>
              {PRIORITY_CONFIG[p].icon} {PRIORITY_CONFIG[p].label}
            </div>
          ))}
        </div>

        {/* Priority Lanes */}
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
          {(['vip', 'high', 'normal'] as const).map(priority => {
            const cfg = PRIORITY_CONFIG[priority];
            const group = groupedEntries[priority] || [];
            if (group.length === 0) return null;
            return (
              <div key={priority} style={cardBase}>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}>
                  <div style={{ width: 4, height: 24, borderRadius: tokens.borderRadius.sm, background: cfg.gradient }} />
                  <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                    {cfg.icon} {cfg.label}
                  </Text>
                  <span style={createBadgeStyle(tokens, cfg.badgeColor)}>{group.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 0 }}>
                  {group.map((entry, idx) => {
                    const isHovered = hoveredEntry === entry.id;
                    return (
                      <div
                        key={entry.id}
                        onMouseEnter={() => setHoveredEntry(entry.id)}
                        onMouseLeave={() => setHoveredEntry(null)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: tokens.spacing[3],
                          padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                          borderBottom: idx < group.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
                          backgroundColor: isHovered ? tokens.colors.neutral[50] : 'transparent',
                          borderRadius: tokens.borderRadius.sm,
                        }}
                      >
                        <div style={{ width: 28, height: 28, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.primaryScale[700], fontWeight: tokens.typography.fontWeight.bold, flexShrink: 0 }}>
                          {entry.position}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], display: 'block' }}>{entry.name}</Text>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{entry.email}</Text>
                        </div>
                        <span style={createBadgeStyle(tokens, 'primary')}>{entry.requestedType}</span>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], minWidth: 50 }}>{timeSince(entry.joinedAt)}</Text>
                        <span style={createBadgeStyle(tokens, statusBadge(entry.status))}>{statusIcon(entry.status)} {entry.status}</span>
                        {entry.status === 'waiting' && (
                          <button onClick={() => onNotify?.(entry.id)} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, backgroundColor: tokens.colors.successScale[50], color: tokens.colors.successScale[700], border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.successScale[200]}`, borderRadius: tokens.borderRadius.sm, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit', fontWeight: tokens.typography.fontWeight.medium }}>
                            Notify
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Presale Codes */}
        <div style={{ ...cardBase }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[3] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>Active Presale Codes</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{presaleCodes.filter(c => c.isActive).length} codes</Text>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[3] }}>
            {presaleCodes.filter(c => c.isActive).map(code => {
              const usagePct = Math.round((code.usageCount / code.maxUses) * 100);
              const pb = createProgressBarStyle(tokens, { percent: usagePct, color: usagePct >= 80 ? tokens.colors.errorScale[500] : tokens.colors.primaryScale[500] });
              return (
                <div key={code.code} style={{ padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[2] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, fontFamily: 'monospace', color: tokens.colors.neutral[900] }}>{code.code}</Text>
                    <span style={createBadgeStyle(tokens, 'success')}>{code.discount}% off</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{code.usageCount}/{code.maxUses}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>exp {formatDate(code.validUntil)}</Text>
                  </div>
                  <div style={pb.track}><div style={pb.fill} /></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div style={{ ...cardBase, marginTop: tokens.spacing[4], display: 'flex', justifyContent: 'space-around', padding: tokens.spacing[3] }}>
          {[
            { label: 'Total Queue', value: entries.length.toString(), emoji: '\uD83D\uDCCB' },
            { label: 'VIP Waiting', value: entries.filter(e => e.priority === 'vip' && e.status === 'waiting').length.toString(), emoji: '\u2B50' },
            { label: 'Converted', value: converted.toString(), emoji: '\u2705' },
            { label: 'Conv. Rate', value: `${conversionRate}%`, emoji: '\uD83D\uDCCA' },
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
