'use client';

/**
 * EvAuditTrail - Timeline Preset
 * Chronological audit feed grouped by date with vertical timeline, colored action dots,
 * entry cards with actor avatars, entity/action badges, filter pills, and export
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createFilterPillStyle,
  getHoverTransform,
} from '../../../helpers';
import type { EvAuditTrailProps, AuditEntry } from '../../core';

const MOCK_ENTRIES: AuditEntry[] = [
  { id: 'a1', entityType: 'event', entityId: 'EVT-001', action: 'create', actor: 'Daniel A.', actorRole: 'admin', details: 'Created event "Neon Nights 2026"', timestamp: new Date('2026-02-08T14:32:00'), ipAddress: '192.168.1.10' },
  { id: 'a2', entityType: 'ticket', entityId: 'TKT-4521', action: 'update', actor: 'Sofia M.', actorRole: 'manager', details: 'Updated pricing tier from $45 to $55', timestamp: new Date('2026-02-08T13:18:00'), ipAddress: '192.168.1.22' },
  { id: 'a3', entityType: 'staff', entityId: 'STF-089', action: 'create', actor: 'Daniel A.', actorRole: 'admin', details: 'Added new staff member Maria S. as Bartender', timestamp: new Date('2026-02-08T12:45:00'), ipAddress: '192.168.1.10' },
  { id: 'a4', entityType: 'contract', entityId: 'CTR-012', action: 'sign', actor: 'DJ Nexus', actorRole: 'artist', details: 'Artist signed contract for Neon Nights', timestamp: new Date('2026-02-08T11:30:00'), ipAddress: '10.0.0.45' },
  { id: 'a5', entityType: 'zone', entityId: 'ZN-003', action: 'update', actor: 'Marco P.', actorRole: 'coordinator', details: 'Changed VIP Lounge capacity from 150 to 200', timestamp: new Date('2026-02-08T10:15:00'), ipAddress: '192.168.1.33' },
  { id: 'a6', entityType: 'access', entityId: 'ACC-221', action: 'deny', actor: 'System', actorRole: 'system', details: 'Denied entry: expired credential at VIP Gate', timestamp: new Date('2026-02-08T09:55:00') },
  { id: 'a7', entityType: 'payment', entityId: 'PAY-078', action: 'process', actor: 'System', actorRole: 'system', details: 'Processed payment of $3,600 for contract CTR-012', timestamp: new Date('2026-02-07T16:42:00') },
  { id: 'a8', entityType: 'event', entityId: 'EVT-001', action: 'update', actor: 'Sofia M.', actorRole: 'manager', details: 'Updated event schedule: added DJ set 10pm-12am', timestamp: new Date('2026-02-07T15:20:00'), ipAddress: '192.168.1.22' },
  { id: 'a9', entityType: 'staff', entityId: 'STF-045', action: 'delete', actor: 'Daniel A.', actorRole: 'admin', details: 'Removed inactive staff member Pedro K.', timestamp: new Date('2026-02-07T14:10:00'), ipAddress: '192.168.1.10' },
  { id: 'a10', entityType: 'ticket', entityId: 'TKT-4522', action: 'create', actor: 'Sofia M.', actorRole: 'manager', details: 'Created new VIP ticket tier at $120', timestamp: new Date('2026-02-07T13:00:00'), ipAddress: '192.168.1.22' },
  { id: 'a11', entityType: 'zone', entityId: 'ZN-001', action: 'alert', actor: 'System', actorRole: 'system', details: 'Main Stage reached 90% capacity threshold', timestamp: new Date('2026-02-07T22:15:00') },
  { id: 'a12', entityType: 'contract', entityId: 'CTR-015', action: 'create', actor: 'Daniel A.', actorRole: 'admin', details: 'Draft contract created for Luna Wave', timestamp: new Date('2026-02-07T11:30:00'), ipAddress: '192.168.1.10' },
];

const ENTITY_TYPES = ['all', 'event', 'ticket', 'staff', 'contract', 'zone', 'access', 'payment'];
const ACTION_TYPES = ['all', 'create', 'update', 'delete', 'sign', 'deny', 'process', 'alert'];

export const TimelineEvAuditTrail = createPreset<EvAuditTrailProps>({
  name: 'EvAuditTrail.Timeline',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvAuditTrailProps>) => {
    const { Box, Text } = primitives;
    const { entries, onEntryClick, onExport, className, style } = props;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const data = entries?.length ? entries : MOCK_ENTRIES;

    const [entityFilter, setEntityFilter] = useState<string>('all');
    const [actionFilter, setActionFilter] = useState<string>('all');
    const [hoveredEntry, setHoveredEntry] = useState<string | null>(null);

    const filtered = useMemo(() => {
      return data.filter(e => {
        if (entityFilter !== 'all' && e.entityType !== entityFilter) return false;
        if (actionFilter !== 'all' && e.action !== actionFilter) return false;
        return true;
      });
    }, [data, entityFilter, actionFilter]);

    // Group by date
    const grouped = useMemo(() => {
      const map: Record<string, AuditEntry[]> = {};
      filtered.forEach(e => {
        const key = e.timestamp.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        if (!map[key]) map[key] = [];
        map[key].push(e);
      });
      // Sort entries within each group by timestamp descending
      Object.values(map).forEach(arr => arr.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
      return Object.entries(map);
    }, [filtered]);

    const actionDotColor = (action: string): string => {
      switch (action) {
        case 'create': return tokens.colors.successScale[500];
        case 'update': return tokens.colors.infoScale[500];
        case 'delete': return tokens.colors.errorScale[500];
        case 'deny': return tokens.colors.errorScale[500];
        case 'sign': return tokens.colors.successScale[500];
        case 'process': return tokens.colors.primaryScale[500];
        case 'alert': return tokens.colors.warningScale[500];
        default: return tokens.colors.neutral[400];
      }
    };

    const actionBadge = (action: string): 'success' | 'warning' | 'error' | 'info' | 'primary' => {
      switch (action) {
        case 'create': return 'success';
        case 'update': return 'info';
        case 'delete': return 'error';
        case 'deny': return 'error';
        case 'sign': return 'success';
        case 'process': return 'primary';
        case 'alert': return 'warning';
        default: return 'info';
      }
    };

    const entityIcon = (type: string): string => {
      switch (type) {
        case 'event': return '\uD83C\uDFAA';
        case 'ticket': return '\uD83C\uDFAB';
        case 'staff': return '\uD83D\uDC64';
        case 'contract': return '\uD83D\uDCDD';
        case 'zone': return '\uD83D\uDCCD';
        case 'access': return '\uD83D\uDD10';
        case 'payment': return '\uD83D\uDCB3';
        default: return '\uD83D\uDCCB';
      }
    };

    const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[4] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>
              {'\u23F3'} Activity Timeline
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {filtered.length} events {'\u00B7'} Chronological view
            </Text>
          </div>
          <div onClick={onExport} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[700], fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', ...hoverStyle }}>
            Export
          </div>
        </div>

        {/* Activity Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          {[
            { label: 'Creates', value: data.filter(e => e.action === 'create').length, color: tokens.colors.successScale[500] },
            { label: 'Updates', value: data.filter(e => e.action === 'update').length, color: tokens.colors.infoScale[500] },
            { label: 'Deletes', value: data.filter(e => e.action === 'delete').length, color: tokens.colors.errorScale[500] },
            { label: 'Alerts', value: data.filter(e => e.action === 'alert' || e.action === 'deny').length, color: tokens.colors.warningScale[500] },
          ].map(s => (
            <div key={s.label} style={{ ...cardBase, padding: tokens.spacing[3], display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <div style={{ width: 10, height: 10, borderRadius: tokens.borderRadius.full, backgroundColor: s.color }} />
              <div>
                <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{s.value}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{s.label}</Text>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Pills */}
        <div style={{ ...cardBase, padding: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          <div style={{ display: 'flex', gap: tokens.spacing[3], alignItems: 'center', flexWrap: 'wrap' as const }}>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500] }}>Entity:</Text>
            <div style={{ display: 'flex', gap: tokens.spacing[1], flexWrap: 'wrap' as const }}>
              {ENTITY_TYPES.map(t => (
                <div key={t} onClick={() => setEntityFilter(t)} style={createFilterPillStyle(tokens, { active: entityFilter === t })}>
                  {t === 'all' ? 'All' : `${entityIcon(t)} ${t.charAt(0).toUpperCase() + t.slice(1)}`}
                </div>
              ))}
            </div>
            <div style={{ width: 1, height: 20, backgroundColor: tokens.colors.neutral[200] }} />
            <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500] }}>Action:</Text>
            <div style={{ display: 'flex', gap: tokens.spacing[1], flexWrap: 'wrap' as const }}>
              {ACTION_TYPES.map(a => (
                <div key={a} onClick={() => setActionFilter(a)} style={createFilterPillStyle(tokens, { active: actionFilter === a })}>
                  {a === 'all' ? 'All' : a.charAt(0).toUpperCase() + a.slice(1)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline */}
        {grouped.length === 0 ? (
          <div style={{ ...cardBase, padding: tokens.spacing[8], textAlign: 'center' as const }}>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>{'\uD83D\uDD0D'}</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>No audit entries match your filters</Text>
          </div>
        ) : grouped.map(([dateLabel, entries]) => (
          <div key={dateLabel} style={{ marginBottom: tokens.spacing[5] }}>
            {/* Date divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginBottom: tokens.spacing[3] }}>
              <div style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[50], border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}` }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.primaryScale[700] }}>{dateLabel}</Text>
              </div>
              <div style={{ flex: 1, height: 1, backgroundColor: tokens.colors.neutral[200] }} />
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{entries.length} events</Text>
            </div>

            {/* Timeline entries */}
            <div style={{ position: 'relative' as const, paddingLeft: tokens.spacing[6] }}>
              {/* Vertical line */}
              <div style={{ position: 'absolute' as const, left: 15, top: 0, bottom: 0, width: 2, backgroundColor: tokens.colors.neutral[200] }} />

              {entries.map((entry, i) => {
                const isHovered = hoveredEntry === entry.id;
                return (
                  <div
                    key={entry.id}
                    onClick={() => onEntryClick?.(entry.id)}
                    onMouseEnter={() => setHoveredEntry(entry.id)}
                    onMouseLeave={() => setHoveredEntry(null)}
                    style={{ position: 'relative' as const, marginBottom: tokens.spacing[3], cursor: 'pointer' }}
                  >
                    {/* Timeline dot */}
                    <div style={{
                      position: 'absolute' as const,
                      left: -tokens.spacing[6] + 10,
                      top: tokens.spacing[3],
                      width: 12,
                      height: 12,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: actionDotColor(entry.action),
                      border: `2px solid ${tokens.colors.common.white}`,
                      boxShadow: `0 0 0 2px ${actionDotColor(entry.action)}40`,
                      zIndex: 1,
                    }} />

                    {/* Entry card */}
                    <div style={{
                      ...cardBase,
                      padding: tokens.spacing[3],
                      backgroundColor: isHovered ? tokens.colors.neutral[50] : tokens.colors.common.white,
                      borderLeft: `3px solid ${actionDotColor(entry.action)}`,
                      transition: `all ${tokens.motion.hover}`,
                      ...(isHovered ? { transform: 'translateX(4px)', boxShadow: tokens.shadows.md } : {}),
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: tokens.spacing[2] }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                          <div style={{ width: 28, height: 28, borderRadius: tokens.borderRadius.full, backgroundColor: entry.actorRole === 'system' ? tokens.colors.neutral[200] : tokens.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: entry.actorRole === 'system' ? tokens.colors.neutral[600] : tokens.colors.primaryScale[700] }}>
                            {entry.actor === 'System' ? '\u2699' : entry.actor.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>{entry.actor}</Text>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{entry.actorRole} {'\u00B7'} {formatTime(entry.timestamp)}</Text>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: tokens.spacing[1], alignItems: 'center' }}>
                          <span style={createBadgeStyle(tokens, actionBadge(entry.action))}>{entry.action}</span>
                          <span style={createBadgeStyle(tokens, 'primary')}>{entityIcon(entry.entityType)} {entry.entityType}</span>
                        </div>
                      </div>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], display: 'block', marginBottom: tokens.spacing[1] }}>
                        {entry.details}
                      </Text>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{entry.entityId}</Text>
                        {entry.ipAddress && (
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], fontFamily: 'monospace' }}>{entry.ipAddress}</Text>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: tokens.spacing[4] }}>
          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
            {'\u2014'} End of audit trail ({filtered.length} entries) {'\u2014'}
          </Text>
        </div>
      </Box>
    );
  },
});
