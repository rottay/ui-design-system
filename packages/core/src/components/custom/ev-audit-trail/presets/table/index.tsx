'use client';

/**
 * EvAuditTrail - Table Preset
 * Full audit log table with search, entity/action/actor filters, color-coded action badges,
 * sortable columns, IP address display, export button, and entity grouping summary
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

export const TableEvAuditTrail = createPreset<EvAuditTrailProps>({
  name: 'EvAuditTrail.Table',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvAuditTrailProps>) => {
    const { Box, Text } = primitives;
    const { entries, onEntryClick, onFilterChange, onExport, className, style } = props;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const data = entries?.length ? entries : MOCK_ENTRIES;

    const [searchTerm, setSearchTerm] = useState('');
    const [entityFilter, setEntityFilter] = useState<string>('all');
    const [actionFilter, setActionFilter] = useState<string>('all');
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    const filtered = useMemo(() => {
      return data.filter(e => {
        if (searchTerm && !e.details.toLowerCase().includes(searchTerm.toLowerCase()) && !e.actor.toLowerCase().includes(searchTerm.toLowerCase()) && !e.entityId.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (entityFilter !== 'all' && e.entityType !== entityFilter) return false;
        if (actionFilter !== 'all' && e.action !== actionFilter) return false;
        return true;
      });
    }, [data, searchTerm, entityFilter, actionFilter]);

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

    const formatTimestamp = (d: Date) => d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    // Entity grouping summary
    const entitySummary = useMemo(() => {
      const map: Record<string, number> = {};
      data.forEach(e => {
        map[e.entityType] = (map[e.entityType] || 0) + 1;
      });
      return Object.entries(map).sort((a, b) => b[1] - a[1]);
    }, [data]);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[4] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>
              {'\uD83D\uDCCB'} Audit Trail
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {filtered.length} of {data.length} entries {'\u00B7'} All system activity
            </Text>
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
            <div onClick={onExport} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[700], fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', ...hoverStyle }}>
              Export CSV
            </div>
          </div>
        </div>

        {/* KPI Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          {[
            { label: 'Total Events', value: data.length, icon: '\uD83D\uDCCA', color: tokens.colors.primaryScale[500] },
            { label: 'Create Actions', value: data.filter(e => e.action === 'create').length, icon: '\u2795', color: tokens.colors.successScale[500] },
            { label: 'Alerts & Denials', value: data.filter(e => e.action === 'alert' || e.action === 'deny').length, icon: '\u26A0\uFE0F', color: tokens.colors.warningScale[500] },
            { label: 'Unique Actors', value: new Set(data.map(e => e.actor)).size, icon: '\uD83D\uDC65', color: tokens.colors.infoScale[500] },
          ].map(s => (
            <div key={s.label} style={{ ...cardBase, padding: tokens.spacing[3], textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1] }}>{s.icon} {s.label}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: s.color, display: 'block' }}>{s.value}</Text>
            </div>
          ))}
        </div>

        {/* Entity Grouping Summary */}
        <div style={{ display: 'flex', gap: tokens.spacing[2], marginBottom: tokens.spacing[4], flexWrap: 'wrap' as const }}>
          {entitySummary.map(([type, count]) => (
            <div key={type} onClick={() => setEntityFilter(entityFilter === type ? 'all' : type)} style={{ ...cardBase, padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, display: 'flex', alignItems: 'center', gap: tokens.spacing[2], cursor: 'pointer', backgroundColor: entityFilter === type ? tokens.colors.primaryScale[50] : tokens.colors.common.white, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${entityFilter === type ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}` }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm }}>{entityIcon(type)}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700], textTransform: 'capitalize' as const }}>{type}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600] }}>{count}</Text>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div style={{ ...cardBase, padding: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          <div style={{ display: 'flex', gap: tokens.spacing[3], alignItems: 'center', flexWrap: 'wrap' as const }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' as const }}>
              <div style={{ position: 'absolute' as const, left: tokens.spacing[3], top: '50%', transform: 'translateY(-50%)', color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>{'\uD83D\uDD0D'}</div>
              <input type="text" placeholder="Search details, actor, or ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing[1], flexWrap: 'wrap' as const }}>
              {ENTITY_TYPES.map(t => (
                <div key={t} onClick={() => setEntityFilter(t)} style={createFilterPillStyle(tokens, { active: entityFilter === t })}>
                  {t === 'all' ? 'All Entities' : t.charAt(0).toUpperCase() + t.slice(1)}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing[1], flexWrap: 'wrap' as const }}>
              {ACTION_TYPES.map(a => (
                <div key={a} onClick={() => setActionFilter(a)} style={createFilterPillStyle(tokens, { active: actionFilter === a })}>
                  {a === 'all' ? 'All Actions' : a.charAt(0).toUpperCase() + a.slice(1)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Audit Table */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <thead>
              <tr style={{ backgroundColor: tokens.colors.neutral[50] }}>
                {['Timestamp', 'Entity', 'Action', 'Actor', 'Role', 'Details', 'IP'].map(h => (
                  <th key={h} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, textAlign: 'left' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center' as const, padding: tokens.spacing[8] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>{'\uD83D\uDD0D'}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>No audit entries match your filters</Text>
                  </td>
                </tr>
              ) : filtered.map(entry => {
                const isHovered = hoveredRow === entry.id;
                return (
                  <tr
                    key={entry.id}
                    onClick={() => onEntryClick?.(entry.id)}
                    onMouseEnter={() => setHoveredRow(entry.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{ cursor: 'pointer', backgroundColor: isHovered ? tokens.colors.neutral[50] : 'transparent', transition: `background-color ${tokens.motion.hover}` }}
                  >
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, whiteSpace: 'nowrap' as const }}>
                      {formatTimestamp(entry.timestamp)}
                    </td>
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm }}>{entityIcon(entry.entityType)}</Text>
                        <div>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], display: 'block', textTransform: 'capitalize' as const }}>{entry.entityType}</Text>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{entry.entityId}</Text>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                      <span style={createBadgeStyle(tokens, actionBadge(entry.action))}>{entry.action}</span>
                    </td>
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                        <div style={{ width: 24, height: 24, borderRadius: tokens.borderRadius.full, backgroundColor: entry.actorRole === 'system' ? tokens.colors.neutral[200] : tokens.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: entry.actorRole === 'system' ? tokens.colors.neutral[600] : tokens.colors.primaryScale[700] }}>
                          {entry.actor === 'System' ? '\u2699' : entry.actor.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{entry.actor}</Text>
                      </div>
                    </td>
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                      <span style={createBadgeStyle(tokens, entry.actorRole === 'admin' ? 'error' : entry.actorRole === 'manager' ? 'warning' : entry.actorRole === 'system' ? 'info' : 'success')}>
                        {entry.actorRole}
                      </span>
                    </td>
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, maxWidth: 280 }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{entry.details}</Text>
                    </td>
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, fontFamily: 'monospace' }}>
                      {entry.ipAddress || '\u2014'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer summary */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: tokens.spacing[3], padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px` }}>
          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
            Showing {filtered.length} of {data.length} entries
          </Text>
          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
            Last activity: {data.length > 0 ? formatTimestamp(data[0].timestamp) : 'N/A'}
          </Text>
        </div>
      </Box>
    );
  },
});
